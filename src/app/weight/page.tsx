'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

interface Record { id: number; date: string; weight: number; change: number; note: string }

export default function WeightPage() {
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newWeight, setNewWeight] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/data/weight.json')
      const data = await res.json()
      setRecords(data)
    } catch {
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleEdit = (id: number, currentWeight: number) => {
    setEditingId(id)
    setEditValue(String(currentWeight))
  }

  const handleSave = (id: number) => {
    const val = parseFloat(editValue)
    if (isNaN(val) || val <= 0) {
      toast.error('请输入有效体重')
      return
    }
    setRecords(prev => prev.map(r => {
      if (r.id !== id) return r
      const prevW = records.find(rr => rr.id === id - 1)?.weight ?? r.weight
      return { ...r, weight: val, change: +(val - prevW).toFixed(1) }
    }))
    setEditingId(null)
    toast.success('💖 已更新！')
    saveToLocal()
  }

  const saveToLocal = () => {
    localStorage.setItem('weight-records', JSON.stringify(records))
    toast.success('💾 已保存到本地')
  }

  const handleAdd = () => {
    if (!newDate || !newWeight) {
      toast.error('请填写日期和体重')
      return
    }
    const w = parseFloat(newWeight)
    const prevW = records[records.length - 1]?.weight ?? w
    const newRec: Record = {
      id: records.length ? Math.max(...records.map(r => r.id)) + 1 : 1,
      date: newDate,
      weight: w,
      change: +(w - prevW).toFixed(1),
      note: '',
    }
    setRecords(prev => [...prev, newRec])
    setNewDate('')
    setNewWeight('')
    setShowAdd(false)
    toast.success('🎉 添加成功！')
  }

  const handleDelete = (id: number) => {
    setRecords(prev => prev.filter(r => r.id !== id))
    toast.success('🗑️ 已删除')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl animate-bounce"
            style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)' }}>💖</div>
          <p style={{ color: '#a890a0' }}>加载中呀...</p>
        </div>
      </div>
    )
  }

  const minW = Math.min(...records.map(r => r.weight))
  const maxW = Math.max(...records.map(r => r.weight))

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      {/* 标题卡片 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-md"
          style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)', boxShadow: '0 4px 20px rgba(255,107,157,0.3)' }}>
          📊
        </div>
        <div>
          <h2 className="font-bold text-xl" style={{ color: '#4a3548' }}>体重记录</h2>
          <p className="text-xs" style={{ color: '#a890a0' }}>✨ 记录每一天的小变化 ✨</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={saveToLocal}
            className="rounded-2xl border-2" style={{ borderColor: '#ffe0e8', color: '#ff6b9d' }}>
            💾 保存
          </Button>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}
            className="text-white border-0 rounded-2xl"
            style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)', boxShadow: '0 4px 16px rgba(255,107,157,0.3)' }}>
            <Plus className="w-4 h-4 mr-1" /> 添加
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: '当前体重', value: (records[records.length-1]?.weight ?? '--') + ' 斤', color: '#ff6b9d' },
          { label: '最低体重', value: minW + ' 斤', color: '#6ec6ff' },
          { label: '最高体重', value: maxW + ' 斤', color: '#c44dff' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-3 shadow-sm border-2"
            style={{ background: '#fff', borderColor: '#ffe0e8' }}>
            <p className="text-xs mb-1" style={{ color: '#a890a0' }}>{s.label}</p>
            <p className="font-bold text-lg" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 添加表单 */}
      {showAdd && (
        <div className="rounded-2xl p-4 mb-4 shadow-md border-2"
          style={{ background: '#fff5f7', borderColor: '#ffd0e0' }}>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <p className="text-xs mb-1" style={{ color: '#a890a0' }}>日期</p>
              <Input value={newDate} onChange={e => setNewDate(e.target.value)}
                placeholder="MM-DD" className="rounded-xl border-2" style={{ borderColor: '#ffe0e8', background: '#fff' }} />
            </div>
            <div className="flex-1">
              <p className="text-xs mb-1" style={{ color: '#a890a0' }}>体重（斤）</p>
              <Input value={newWeight} onChange={e => setNewWeight(e.target.value)}
                placeholder="52.5" type="number" className="rounded-xl border-2" style={{ borderColor: '#ffe0e8', background: '#fff' }} />
            </div>
            <Button size="sm" onClick={handleAdd}
              className="rounded-xl text-white border-0"
              style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)' }}>
              确认
            </Button>
          </div>
        </div>
      )}

      {/* 记录列表 */}
      <div className="space-y-2">
        {records.map((r, i) => {
          const prev = i > 0 ? records[i-1].weight : r.weight
          const diff = +(r.weight - prev).toFixed(1)
          const isEditing = editingId === r.id
          return (
            <div key={r.id} className="rounded-2xl p-3 shadow-sm border-2 transition-all duration-200 hover:shadow-md"
              style={{ background: i % 2 === 0 ? '#fff' : '#fff8fa', borderColor: '#ffe0e8' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg,#fff0f5,#f0e6ff)', color: '#ff6b9d' }}>
                  {r.date.slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: '#4a3548' }}>{r.date}</span>
                    {diff > 0 && <Badge className="rounded-full bg-red-50 text-red-500 border-0 text-xs">+{diff}</Badge>}
                    {diff < 0 && <Badge className="rounded-full bg-green-50 text-green-500 border-0 text-xs">{diff}</Badge>}
                    {diff === 0 && <Badge className="rounded-full bg-gray-50 text-gray-400 border-0 text-xs">0</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <Input value={editValue} onChange={e => setEditValue(e.target.value)}
                        className="w-20 h-8 text-sm rounded-xl border-2" style={{ borderColor: '#ff6b9d' }} />
                      <Button size="sm" onClick={() => handleSave(r.id)}
                        className="h-8 px-3 rounded-xl text-white border-0 text-xs"
                        style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)' }}>保存</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}
                        className="h-8 px-2 rounded-xl text-xs" style={{ color: '#a890a0' }}>取消</Button>
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-lg" style={{ color: '#ff6b9d' }}>{r.weight}</span>
                      <span className="text-xs" style={{ color: '#d4b0c0' }}>斤</span>
                      <button onClick={() => handleEdit(r.id, r.weight)}
                        className="ml-1 p-1 rounded-full hover:bg-pink-50 transition-colors" title="编辑">
                        <Sparkles className="w-3.5 h-3.5" style={{ color: '#d4b0c0' }} />
                      </button>
                      <button onClick={() => handleDelete(r.id)}
                        className="p-1 rounded-full hover:bg-red-50 transition-colors" title="删除">
                        <Trash2 className="w-3.5 h-3.5 text-red-300" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
