'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

interface Sheet {
  id: string
  name: string
  index: number
}

export default function WeightPage() {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [currentSheet, setCurrentSheet] = useState<string>('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<any[][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  
  // 编辑状态
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [saving, setSaving] = useState(false)

  // 加载 sheet 列表
  useEffect(() => {
    fetchSheets()
  }, [])

  // 加载单元格数据
  useEffect(() => {
    if (currentSheet) {
      fetchCells(currentSheet)
    }
  }, [currentSheet])

  async function fetchSheets() {
    try {
      setLoading(true)
      const res = await fetch('/api/kdocs/read?action=sheets')
      const json = await res.json()
      
      if (json.sheets) {
        setSheets(json.sheets)
        const weightSheet = json.sheets.find((s: Sheet) => s.name.includes('体重'))
        if (weightSheet) {
          setCurrentSheet(weightSheet.id)
        } else if (json.sheets.length > 0) {
          setCurrentSheet(json.sheets[0].id)
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCells(sheetId: string) {
    try {
      setLoading(true)
      const res = await fetch(`/api/kdocs/read?action=cells&sheetId=${sheetId}&rowFrom=0&rowTo=200&colFrom=0&colTo=30`)
      const json = await res.json()
      
      if (json.values) {
        setHeaders(json.values[0] || [])
        setRows(json.values.slice(1))
      }
    } catch (err: any) {
      setError(err.message)
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

  // 保存编辑
  async function saveEdit() {
    if (!editingCell || !currentSheet) return

    try {
      setSaving(true)
      const res = await fetch('/api/kdocs/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: currentSheet,
          cells: [{
            row: editingCell.row,
            col: editingCell.col,
            value: editValue,
          }],
        }),
      })

      const json = await res.json()
      
      if (json.success) {
        toast.success('保存成功！')
        // 更新本地数据
        setRows(prev => {
          const newRows = [...prev]
          newRows[editingCell.row] = [...newRows[editingCell.row]]
          newRows[editingCell.row][editingCell.col] = editValue
          return newRows
        })
        cancelEdit()
      } else {
        toast.error(`保存失败: ${json.error || '未知错误'}`)
      }
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

  if (loading && !currentSheet) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">体重板块</h1>
        <Badge variant="outline">实时读取金山文档</Badge>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-600">{error}</CardContent>
        </Card>
      )}

      {/* Sheet 切换 */}
      <div className="flex gap-2 flex-wrap">
        {sheets.map((sheet) => (
          <Button
            key={sheet.id}
            variant={currentSheet === sheet.id ? 'default' : 'outline'}
            onClick={() => setCurrentSheet(sheet.id)}
          >
            {sheet.name}
          </Button>
        ))}
      </div>

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>数据列表（点击单元格编辑）</CardTitle>
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
