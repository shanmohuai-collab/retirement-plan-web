'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Sparkles, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

interface InvestmentRecord { id: number; date: string; prediction: string; reason: string; result: string }

export default function InvestmentPage() {
  const [records, setRecords] = useState<InvestmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newPrediction, setNewPrediction] = useState('')
  const [newReason, setNewReason] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/data/investment.json')
      const data = await res.json()
      setRecords(data)
    } catch {
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = (id: number) => {
    if (!editValue.trim()) { toast.error('内容不能为空'); return }
    setRecords(prev => prev.map(r => r.id === id ? { ...r, result: editValue } : r))
    setEditingId(null)
    toast.success('💖 已更新！')
    localStorage.setItem('investment-records', JSON.stringify(records))
  }

  const handleAdd = () => {
    if (!newDate || !newPrediction) { toast.error('请填写日期和预测'); return }
    const newRec: InvestmentRecord = {
      id: records.length ? Math.max(...records.map(r => r.id)) + 1 : 1,
      date: newDate, prediction: newPrediction, reason: newReason, result: '待公布',
    }
    setRecords(prev => [...prev, newRec])
    setNewDate(''); setNewPrediction(''); setNewReason('')
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

  const correctCount = records.filter(r => {
    if (r.result === '待公布') return false
    return (r.prediction === '涨' && r.result.includes('涨')) ||
           (r.prediction === '跌' && r.result.includes('跌'))
  }).length
  const doneCount = records.filter(r => r.result !== '待公布').length
  const accuracy = doneCount > 0 ? Math.round(correctCount / doneCount * 100) : 0

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      {/* 标题卡片 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-md"
          style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)', boxShadow: '0 4px 20px rgba(255,107,157,0.3)' }}>
          💰
        </div>
        <div>
          <h2 className="font-bold text-xl" style={{ color: '#4a3548' }}>投资记录</h2>
          <p className="text-xs" style={{ color: '#a890a0' }}>✨ 每一次预测都是学习 ✨</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { localStorage.setItem('investment-records', JSON.stringify(records)); toast.success('💾 已保存到本地') }}
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
          { label: '总预测', value: records.length, color: '#ff6b9d' },
          { label: '已公布', value: doneCount, color: '#6ec6ff' },
          { label: '准确率', value: `${accuracy}%`, color: '#c44dff' },
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
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <p className="text-xs mb-1" style={{ color: '#a890a0' }}>日期</p>
              <Input value={newDate} onChange={e => setNewDate(e.target.value)}
                placeholder="MM-DD" className="rounded-xl border-2" style={{ borderColor: '#ffe0e8', background: '#fff' }} />
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#a890a0' }}>预测</p>
              <div className="flex gap-1">
                {['涨','跌'].map(p => (
                  <button key={p} onClick={() => setNewPrediction(p)}
                    className="flex-1 py-1.5 text-xs rounded-xl border-2 transition-all"
                    style={{
                      borderColor: newPrediction === p ? (p==='涨'?'#7ee8a2':'#ff8fa3') : '#ffe0e8',
                      background: newPrediction === p ? (p==='涨'?'#7ee8a222':'#ff8fa322') : '#fff',
                      color: newPrediction === p ? (p==='涨'?'#7ee8a2':'#ff8fa3') : '#a890a0',
                    }}>
                    {p==='涨' ? '📈' : '📉'} {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-xs mb-1" style={{ color: '#a890a0' }}>理由</p>
            <Input value={newReason} onChange={e => setNewReason(e.target.value)}
              placeholder="美联储降息预期..." className="rounded-xl border-2" style={{ borderColor: '#ffe0e8', background: '#fff' }} />
          </div>
          <Button size="sm" onClick={handleAdd}
            className="text-white border-0 rounded-xl text-xs"
            style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)' }}>
            确认添加
          </Button>
        </div>
      )}

      {/* 记录列表 */}
      <div className="space-y-2">
        {records.map((r, i) => {
          const isCorrect = r.result !== '待公布' && (
            (r.prediction === '涨' && r.result.includes('涨')) ||
            (r.prediction === '跌' && r.result.includes('跌'))
          )
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
                    <Badge className="rounded-full text-xs border-0"
                      style={{
                        background: r.prediction === '涨' ? '#7ee8a222' : '#ff8fa322',
                        color: r.prediction === '涨' ? '#7ee8a2' : '#ff8fa3',
                      }}>
                      {r.prediction === '涨' ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                      {r.prediction}
                    </Badge>
                    {r.result !== '待公布' && (
                      <Badge className="rounded-full text-xs border-0"
                        style={{
                          background: isCorrect ? '#7ee8a222' : '#ff8fa322',
                          color: isCorrect ? '#7ee8a2' : '#ff8fa3',
                        }}>
                        {isCorrect ? '✅ 正确' : '❌ 错误'}
                      </Badge>
                    )}
                    {r.result === '待公布' && (
                      <Badge className="rounded-full text-xs border-0" style={{ background: '#f0e6ff22', color: '#c44dff' }}>⏳ 待公布</Badge>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#a890a0' }}>{r.reason}</p>
                </div>
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <Input value={editValue} onChange={e => setEditValue(e.target.value)}
                        className="w-28 h-8 text-xs rounded-xl border-2" style={{ borderColor: '#ff6b9d' }} />
                      <Button size="sm" onClick={() => handleSave(r.id)}
                        className="h-8 px-3 rounded-xl text-white border-0 text-xs"
                        style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)' }}>保存</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}
                        className="h-8 px-2 rounded-xl text-xs" style={{ color: '#a890a0' }}>取消</Button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-mono" style={{ color: '#4a3548' }}>{r.result}</span>
                      <button onClick={() => { setEditingId(r.id); setEditValue(r.result) }}
                        className="p-1 rounded-full hover:bg-pink-50 transition-colors" title="编辑结果">
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
