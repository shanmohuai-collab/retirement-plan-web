'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Plus, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { getDaysInMonth, getDay, startOfMonth } from 'date-fns'

interface WeightRecord { id: number; date: string; weight: number; change: number; note: string }

export default function WeightPage() {
  const [records, setRecords] = useState<WeightRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newWeight, setNewWeight] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/data/weight.json?t=' + Date.now())
      const text = await res.text()
      const data = JSON.parse(text)
      setRecords(data)
    } catch (e) {
      toast.error('加载失败')
      console.error(e)
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
    if (isNaN(val) || val <= 0) { toast.error('请输入有效体重'); return }
    setRecords(prev => prev.map(r => {
      if (r.id !== id) return r
      const prevW = prev.find(rr => rr.id === id - 1)?.weight ?? r.weight
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
    if (!newDate || !newWeight) { toast.error('请填写日期和体重'); return }
    const w = parseFloat(newWeight)
    const prevW = records[records.length - 1]?.weight ?? w
    const newRec: WeightRecord = {
      id: records.length ? Math.max(...records.map(r => r.id)) + 1 : 1,
      date: newDate,
      weight: w,
      change: +(w - prevW).toFixed(1),
      note: '',
    }
    setRecords(prev => [...prev, newRec])
    setNewDate(''); setNewWeight(''); setShowAdd(false)
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

  // 日历数据
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getDay(startOfMonth(currentMonth))
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  const monthRecords = records.filter(r => r.date.startsWith(monthStr))

  // 日历格子
  const calendarDays: (WeightRecord | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${monthStr}-${String(d).padStart(2, '0')}`
    const rec = records.find(r => r.date === dateStr)
    calendarDays.push(rec ?? null)
  }

  // 折线图数据（最近30条）
  const chartData = [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map(r => ({ date: r.date.slice(5), weight: r.weight, change: r.change }))

  const allWeights = records.map(r => r.weight)
  const minW = Math.min(...allWeights)
  const maxW = Math.max(...allWeights)
  const latest = records[records.length - 1]

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-md"
          style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)', boxShadow: '0 4px 20px rgba(255,107,157,0.3)' }}>
          📊
        </div>
        <div>
          <h2 className="font-bold text-xl" style={{ color: '#4a3548' }}>体重记录</h2>
          <p className="text-xs" style={{ color: '#a890a0' }}>✨ 每一天都在变更好 ✨</p>
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
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: '当前', value: latest ? `${latest.weight} 斤` : '--', color: '#ff6b9d' },
          { label: '最低', value: `${minW} 斤`, color: '#6ec6ff' },
          { label: '最高', value: `${maxW} 斤`, color: '#c44dff' },
          { label: '总变化', value: latest ? `${(latest.weight - records[0]?.weight).toFixed(1)} 斤` : '--', color: '#7ee8a2' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-3 shadow-sm border-2"
            style={{ background: '#fff', borderColor: '#ffe0e8' }}>
            <p className="text-xs mb-1" style={{ color: '#a890a0' }}>{s.label}</p>
            <p className="font-bold text-lg" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 折线趋势图 */}
      <Card className="mb-5 border-0 shadow-lg" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.9)', border: '2px solid #ffe0e8' }}>
        <CardContent className="p-4">
          <h3 className="font-bold text-base mb-3" style={{ color: '#4a3548' }}>📈 体重趋势（最近30条）</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffe0e8" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a890a0' }} interval="preserveStartEnd" />
              <YAxis domain={[minW - 2, maxW + 2]} tick={{ fontSize: 11, fill: '#a890a0' }} />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: '2px solid #ffe0e8', background: '#fff' }}
                formatter={(value: any) => [`${value} 斤`, '体重']}
              />
              <ReferenceLine y={150} label="目标" stroke="#7ee8a2" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="weight" stroke="#ff6b9d" strokeWidth={3}
                dot={{ r: 4, fill: '#ff6b9d', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#c44dff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 月历视图 */}
      <Card className="mb-5 border-0 shadow-lg" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.9)', border: '2px solid #ffe0e8' }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Button size="sm" variant="ghost" onClick={() => setCurrentMonth(new Date(year, month - 1))}
              className="rounded-full w-8 h-8 p-0" style={{ color: '#ff6b9d' }}>‹</Button>
            <h3 className="font-bold text-base" style={{ color: '#4a3548' }}>
              {year}年{month + 1}月
            </h3>
            <Button size="sm" variant="ghost" onClick={() => setCurrentMonth(new Date(year, month + 1))}
              className="rounded-full w-8 h-8 p-0" style={{ color: '#ff6b9d' }}>›</Button>
          </div>
          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            {['日','一','二','三','四','五','六'].map(d => (
              <div key={d} className="text-xs font-bold py-1" style={{ color: '#d4b0c0' }}>{d}</div>
            ))}
          </div>
          {/* 日历格子 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((rec, i) => {
              let cellStyle: React.CSSProperties = { background: 'transparent' }
              let cellCls = 'rounded-2xl p-1 min-h-[52px] flex flex-col items-center justify-start text-xs'
              if (rec) {
                cellCls += ' shadow-sm hover:shadow-md cursor-pointer'
                if (rec.change > 0) cellStyle.background = 'linear-gradient(135deg, #fff0f0, #fff5f5)'
                else if (rec.change < 0) cellStyle.background = 'linear-gradient(135deg, #f0fff5, #f5fff8)'
                else cellStyle.background = 'linear-gradient(135deg, #fff8f0, #fffaf5)'
                cellStyle.border = '1.5px solid #ffe0e8'
              }
              return (
                <div key={i} className={cellCls} style={cellStyle}>
                  {rec && (
                    <>
                      <span className="text-[10px] font-bold" style={{ color: '#d4b0c0' }}>{rec.date.slice(8)}</span>
                      <span className="font-bold text-sm" style={{ color: '#ff6b9d' }}>{rec.weight}</span>
                      {rec.change !== 0 && (
                        <span className="text-[9px] font-bold"
                          style={{ color: rec.change > 0 ? '#ff4444' : '#44bb44' }}>
                          {rec.change > 0 ? `+${rec.change}` : rec.change}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
          {/* 图例 */}
          <div className="flex justify-center gap-3 mt-2 text-[10px]" style={{ color: '#d4b0c0' }}>
            <span>🔴 涨了</span>
            <span>🟢 降了</span>
            <span>🟡 持平</span>
          </div>
        </CardContent>
      </Card>

      {/* 添加表单 */}
      {showAdd && (
        <div className="rounded-2xl p-4 mb-4 shadow-md border-2"
          style={{ background: '#fff5f7', borderColor: '#ffd0e0' }}>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <p className="text-xs mb-1" style={{ color: '#a890a0' }}>日期</p>
              <Input value={newDate} onChange={e => setNewDate(e.target.value)}
                placeholder="2026-05-24" className="rounded-xl border-2" style={{ borderColor: '#ffe0e8', background: '#fff' }} />
            </div>
            <div className="flex-1">
              <p className="text-xs mb-1" style={{ color: '#a890a0' }}>体重（斤）</p>
              <Input value={newWeight} onChange={e => setNewWeight(e.target.value)}
                placeholder="173.8" type="number" className="rounded-xl border-2" style={{ borderColor: '#ffe0e8', background: '#fff' }} />
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
        <h3 className="font-bold text-base mb-2" style={{ color: '#4a3548' }}>📝 详细记录</h3>
        {[...records].reverse().map((r, i) => {
          const isEditing = editingId === r.id
          return (
            <div key={r.id} className="rounded-2xl p-3 shadow-sm border-2 transition-all duration-200 hover:shadow-md"
              style={{ background: i % 2 === 0 ? '#fff' : '#fff8fa', borderColor: '#ffe0e8' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg,#fff0f5,#f0e6ff)', color: '#ff6b9d' }}>
                  {r.date.slice(5, 10)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: '#4a3548' }}>{r.weight} 斤</span>
                    {r.change > 0 && <span className="text-xs font-bold" style={{ color: '#ff4444' }}>+{r.change}</span>}
                    {r.change < 0 && <span className="text-xs font-bold" style={{ color: '#44bb44' }}>{r.change}</span>}
                    {r.change === 0 && <span className="text-xs" style={{ color: '#d4b0c0' }}>0</span>}
                  </div>
                  {r.note && <p className="text-xs mt-0.5 truncate" style={{ color: '#d4b0c0' }}>{r.note}</p>}
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
                      <button onClick={() => handleEdit(r.id, r.weight)}
                        className="p-1 rounded-full hover:bg-pink-50 transition-colors" title="编辑">
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
