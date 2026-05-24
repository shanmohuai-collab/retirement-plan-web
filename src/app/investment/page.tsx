'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

export default function InvestmentPage() {
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<any[][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const res = await fetch('/data/investment.json')
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

  function startEdit(rowIndex: number, colIndex: number, currentValue: any) {
    setEditingCell({ row: rowIndex, col: colIndex })
    setEditValue(String(currentValue || ''))
  }

  function cancelEdit() {
    setEditingCell(null)
    setEditValue('')
  }

  async function saveEdit() {
    if (!editingCell) return
    try {
      setSaving(true)
      const storageKey = 'investment_edits'
      const edits = JSON.parse(localStorage.getItem(storageKey) || '{}')
      const key = `${editingCell.row}_${editingCell.col}`
      edits[key] = editValue
      localStorage.setItem(storageKey, JSON.stringify(edits))
      
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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') saveEdit()
    else if (e.key === 'Escape') cancelEdit()
  }

  // 涨跌样式
  function getChangeClass(value: any): string {
    if (!value) return ''
    const str = String(value)
    if (str.includes('涨') || str.includes('+') || str.includes('上升')) return 'text-red-600 font-semibold'
    if (str.includes('跌') || str.includes('-') || str.includes('下降')) return 'text-green-600 font-semibold'
    return ''
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">投资板块</h1>
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
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">总预测数</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{summary.totalPredictions || 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">准确预测</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-green-600">{summary.correctPredictions || 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">准确率</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{summary.accuracy || '-'}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">近期趋势</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{summary.recentTrend || '-'}</p></CardContent>
          </Card>
        </div>
      )}

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>黄金涨跌预测记录（点击单元格编辑，仅本地保存）</CardTitle>
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
                      <TableCell key={colIndex} className={getChangeClass(cellValue)}>
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

      {/* 关键因素 */}
      {summary?.keyFactors && (
        <Card>
          <CardHeader>
            <CardTitle>关键影响因素</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {summary.keyFactors.map((factor: string, index: number) => (
                <Badge key={index} variant="secondary">{factor}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
