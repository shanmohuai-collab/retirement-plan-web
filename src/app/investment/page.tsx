'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

interface InvestmentRecord {
  [key: string]: string
}

export default function InvestmentPage() {
  const [data, setData] = useState<InvestmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
        const res = await fetch('/api/kdocs/read?sheet=投资板块')
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
          sheet: '投资板块',
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

  const getPredictionBadge = (prediction: string) => {
    if (prediction.includes('涨')) return 'bg-red-100 text-red-800'
    if (prediction.includes('跌')) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
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
        <h1 className="text-3xl font-bold">💰 投资板块</h1>
        <Button onClick={fetchData} variant="outline">刷新数据</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>黄金涨跌预测与复盘</CardTitle>
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
                                className="h-8 w-32"
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
                              {key.includes('预测') && typeof value === 'string' ? (
                                <Badge className={getPredictionBadge(value)}>{value}</Badge>
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
          <CardTitle>📈 投资逻辑</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline">黄金预测</Badge>
              <span>关注美国PPI/CPI数据、美联储降息预期、地缘风险</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">基金板块</Badge>
              <span>关注A股三大指数、基金涨跌分化、行业轮动（新能源/AI算力/游戏/医药）</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">中国投资逻辑</Badge>
              <span>从"外部地缘博弈"转向"内部景气验证"，一季报密集期业绩为王</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
