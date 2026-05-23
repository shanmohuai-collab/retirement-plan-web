'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

interface WritingRecord {
  [key: string]: string
}

export default function WritingPage() {
  const [data, setData] = useState<WritingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/kdocs/read?sheet=网文板块')
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        toast.error('读取失败：' + json.error)
      }
    } catch (err: any) {
      toast.error('网络错误：' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (rowIndex: number, colKey: string, currentValue: string) => {
    setEditingCell({ row: rowIndex, col: colKey })
    setEditValue(currentValue || '')
  }

  const handleSave = async (rowIndex: number, colKey: string) => {
    try {
      const res = await fetch('/api/kdocs/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet: '网文板块',
          row: rowIndex,
          col: colKey,
          value: editValue
        })
      })
      const json = await res.json()
      if (json.success) {
        toast.success('保存成功')
        setData(prev => {
          const newData = [...prev]
          newData[rowIndex] = { ...newData[rowIndex], [colKey]: editValue }
          return newData
        })
      } else {
        toast.error('保存失败：' + json.error)
      }
    } catch (err: any) {
      toast.error('网络错误：' + err.message)
    } finally {
      setEditingCell(null)
      setEditValue('')
    }
  }

  const handleCancel = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const getGenreBadge = (genre: string) => {
    const colorMap: { [key: string]: string } = {
      '言情': 'bg-pink-100 text-pink-800',
      '悬疑': 'bg-purple-100 text-purple-800',
      '世情': 'bg-blue-100 text-blue-800',
      '亲情': 'bg-green-100 text-green-800',
    }
    return colorMap[genre] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📝 网文板块</h1>
        <Button onClick={fetchData} variant="outline">刷新数据</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>写作进度跟踪</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无数据
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(data[0]).map(key => (
                      <TableHead key={key} className="whitespace-nowrap">{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Object.entries(row).map(([key, value]) => (
                        <TableCell key={key} className="whitespace-nowrap">
                          {editingCell?.row === rowIndex && editingCell?.col === key ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-8 w-24"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSave(rowIndex, key)
                                  if (e.key === 'Escape') handleCancel()
                                }}
                              />
                              <Button size="sm" onClick={() => handleSave(rowIndex, key)} className="h-8 px-2">✓</Button>
                              <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 px-2">✕</Button>
                            </div>
                          ) : (
                            <div
                              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                              onClick={() => handleEdit(rowIndex, key, String(value))}
                            >
                              {key.includes('题材') && typeof value === 'string' ? (
                                <Badge className={getGenreBadge(value)}>{value}</Badge>
                              ) : (
                                <span className="text-sm">{String(value)}</span>
                              )}
                            </div>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 创作工作流</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {['看文', '灵感', '导语', '大纲', '成文', '修文', '投稿'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm py-1">{step}</Badge>
                {i < 6 && <span className="text-gray-400">→</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
