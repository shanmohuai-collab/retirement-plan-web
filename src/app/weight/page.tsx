'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

export default function WeightPage() {
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<any[][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  
  // 编辑状态
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [summary, setSummary] = useState<any>(null)

  // 加载数据
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const res = await fetch('/data/weight.json')
      if (!res.ok) throw new Error('加载数据失败')
      const json = await res.json()
      
      setHeaders(json.headers || [])
      setRows(json.rows || [])
      setSummary(json.summary || null)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 开始编辑单元格
  function startEdit(rowIndex: number, colIndex: number, currentValue: any) {
    setEditingCell({ row: rowIndex, col: colIndex })
    setEditValue(String(currentValue || ''))
  }

  // 取消编辑
  function cancelEdit() {
    setEditingCell(null)
    setEditValue('')
  }

  // 保存编辑（保存到 localStorage，并提示用户）
  async function saveEdit() {
    if (!editingCell) return
    
    try {
      setSaving(true)
      
      // 保存到 localStorage
      const storageKey = 'weight_edits'
      const edits = JSON.parse(localStorage.getItem(storageKey) || '{}')
      const key = `${editingCell.row}_${editingCell.col}`
      edits[key] = editValue
      localStorage.setItem(storageKey, JSON.stringify(edits))
      
      // 更新本地数据
      setRows(prev => {
        const newRows = [...prev]
        newRows[editingCell.row] = [...newRows[editingCell.row]]
        newRows[editingCell.row][editingCell.col] = editValue
        return newRows
      })
      
      toast.success('已保存到本地（刷新后失效）。真实数据请在金山文档 Excel 中修改。')
      cancelEdit()
    } catch (err: any) {
      toast.error(`保存失败: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // 处理回车键
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">体重板块</h1>
        <Badge variant="outline">数据来源：金山文档（每日自动同步）</Badge>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-600">{error}</CardContent>
        </Card>
      )}

      {/* 统计卡片 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">起始体重</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{summary.startWeight} 斤</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">当前体重</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{summary.currentWeight} 斤</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">已减重量</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-green-600">-{summary.totalLoss} 斤</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">百日进度</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{summary.progress}</p></CardContent>
          </Card>
        </div>
      )}

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>数据列表（点击单元格编辑，仅本地保存）</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead key={index}>{header || `列${index + 1}`}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((header, colIndex) => {
                    const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex
                    const cellValue = row[colIndex]

                    return (
                      <TableCell key={colIndex}>
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              disabled={saving}
                              className="h-8"
                              autoFocus
                            />
                            <Button size="sm" onClick={saveEdit} disabled={saving} className="h-8 px-2">
                              保存
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 px-2">
                              取消
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={() => startEdit(rowIndex, colIndex, cellValue)}
                            className="cursor-pointer hover:bg-gray-100 min-h-[32px] py-1 px-2 rounded"
                          >
                            {cellValue || '-'}
                          </div>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
