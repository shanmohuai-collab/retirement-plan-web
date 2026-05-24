'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Plus, Sparkles, Calendar, Target } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Area
} from 'recharts'
import { getDaysInMonth, getDay, startOfMonth, format, parseISO } from 'date-fns'

interface WeightRecord { date: string; weight: number; change: number }

// 线性回归计算
function linearRegression(records: WeightRecord[]) {
  const n = records.length
  if (n < 2) return { slope: 0, intercept: 0 }
  const x = records.map((_, i) => i)
  const y = records.map(r => r.weight)
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0)
  const sumX2 = x.reduce((s, xi) => s + xi * xi, 0)
  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return { slope: 0, intercept: 0 }
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

// 预测到达目标体重的天数
function predictDaysToTarget(records: WeightRecord[], target: number) {
  if (records.length < 2) return null
  const { slope, intercept } = linearRegression(records)
  if (!isFinite(slope) || slope >= 0) return null
  const days = (target - intercept) / slope
  if (!isFinite(days) || days <= records.length - 1) return null
  return Math.round(days)
}

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
      const data = JSON.parse(text) as WeightRecord[]
      setRecords(data)
    } catch (e) {
      toast.error('加载失败')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleEdit = (index: number, currentWeight: number) => {
    setEditingId(index)
    setEditValue(String(currentWeight))
  }

  const handleSave = (index: number) => {
    const val = parseFloat(editValue)
    if (isNaN(val) || val <= 0) { toast.error('请输入有效体重'); return }
    setRecords(prev => {
      const next = [...prev]
      next[index] = { ...next[index], weight: val }
      // 重新计算变化量
      if (index > 0) next[index].change = +(val - next[index - 1].weight).toFixed(1)
      if (index < next.length - 1) next[index + 1].change = +(next[index + 1].weight - val).toFixed(1)
      return next
    })
    setEditingId(null)
    toast.success('已更新！')
  }

  const handleAdd = () => {
    if (!newDate || !newWeight) { toast.error('请填写日期和体重'); return }
    const w = parseFloat(newWeight)
    const prevW = records[records.length - 1]?.weight ?? w
    const newRec: WeightRecord = { date: newDate, weight: w, change: +(w - prevW).toFixed(1) }
    setRecords(prev => [...prev, newRec])
    setNewDate(''); setNewWeight(''); setShowAdd(false)
    toast.success('添加成功！')
  }

  const handleDelete = (index: number) => {
    setRecords(prev => {
      const next = prev.filter((_, i) => i !== index)
      if (index < next.length && index > 0) {
        next[index].change = +(next[index].weight - next[index - 1].weight).toFixed(1)
      }
      return next
    })
    toast.success('已删除')
  }

  // 按月份分组
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, WeightRecord[]> = {}
    for (const r of records) {
      const key = r.date.slice(0, 7) // 2026-02
      if (!groups[key]) groups[key] = []
      groups[key].push(r)
    }
    return groups
  }, [records])

  const monthNames: Record<string, string> = {
    '2026-02': '2月', '2026-03': '3月', '2026-04': '4月', '2026-05': '5月',
    '2026-06': '6月', '2026-07': '7月', '2026-08': '8月', '2026-09': '9月',
  }

  // 图表数据
  const chartData = useMemo(() => {
    const data = records.map((r, i) => ({
      date: r.date.slice(5), // 05-24
      fullDate: r.date,
      weight: r.weight,
      change: r.change,
      index: i,
    }))
    const { slope, intercept } = linearRegression(records)
    // 为每个点计算回归预测值
    return data.map(d => ({
      ...d,
      regression: +(intercept + slope * d.index).toFixed(1),
    }))
  }, [records])

  // 预测目标日期
  const predictions = useMemo(() => {
    const targets = [160, 150, 140]
    const baseDate = records.length > 0 ? parseISO(records[0].date) : new Date()
    return targets.map(t => {
      const days = predictDaysToTarget(records, t)
      if (days === null) return { target: t, date: null }
      const d = new Date(baseDate)
      d.setDate(d.getDate() + days)
      return { target: t, date: format(d, 'M月d日'), days }
    })
  }, [records])

  const allWeights = records.map(r => r.weight)
  const minW = allWeights.length ? Math.min(...allWeights) : 0
  const maxW = allWeights.length ? Math.max(...allWeights) : 0
  const latest = records[records.length - 1]

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

  const calendarDays: (WeightRecord | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${monthStr}-${String(d).padStart(2, '0')}`
    const rec = records.find(r => r.date === dateStr)
    calendarDays.push(rec ?? null)
  }

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
          { label: '最低', value: allWeights.length ? `${minW} 斤` : '--', color: '#6ec6ff' },
          { label: '最高', value: allWeights.length ? `${maxW} 斤` : '--', color: '#c44dff' },
          { label: '总变化', value: (latest && records[0]) ? `${(latest.weight - records[0].weight).toFixed(1)} 斤` : '--', color: '#7ee8a2' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-3 shadow-sm border-2"
            style={{ background: '#fff', borderColor: '#ffe0e8' }}>
            <p className="text-xs mb-1" style={{ color: '#a890a0' }}>{s.label}</p>
            <p className="font-bold text-lg" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 预测卡片 */}
      <Card className="mb-5 border-0 shadow-lg" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.9)', border: '2px solid #ffe0e8' }}>
        <CardContent className="p-4">
          <h3 className="font-bold text-base mb-3 flex items-center gap-2" style={{ color: '#4a3548' }}>
            <Target className="w-5 h-5" style={{ color: '#ff6b9d' }} />
            目标预测（基于线性回归）
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {predictions.map((p, i) => (
              <div key={i} className="rounded-2xl p-3 text-center border-2"
                style={{ background: p.date ? '#f0fff5' : '#fff5f5', borderColor: p.date ? '#b8e6c8' : '#ffd0d0' }}>
                <p className="text-xs font-bold mb-1" style={{ color: '#a890a0' }}>{p.target}斤</p>
                {p.date ? (
                  <>
                    <p className="font-bold text-lg" style={{ color: '#44bb44' }}>{p.date}</p>
                    <p className="text-[10px]" style={{ color: '#a890a0' }}>预计{p.days}天后</p>
                  </>
                ) : (
                  <p className="font-bold text-sm" style={{ color: '#ff6b9d' }}>已过/趋势不明</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 折线趋势图（含回归线） */}
      <Card className="mb-5 border-0 shadow-lg" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.9)', border: '2px solid #ffe0e8' }}>
        <CardContent className="p-4">
          <h3 className="font-bold text-base mb-3" style={{ color: '#4a3548' }}>📈 体重趋势 & 回归预测</h3>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffe0e8" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#a890a0' }} interval="preserveStartEnd" />
              <YAxis domain={[Math.min(minW, 135) - 2, maxW + 3]} tick={{ fontSize: 11, fill: '#a890a0' }} />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: '2px solid #ffe0e8', background: '#fff' }}
                formatter={(value: any, name: any) => {
                  if (name === 'weight') return [`${value} 斤`, '实际体重']
                  if (name === 'regression') return [`${value} 斤`, '回归预测']
                  return [value, name]
                }}
              />
              {/* 目标线 */}
              <ReferenceLine y={160} label={{ value: '160斤', position: 'right', fill: '#44bb44', fontSize: 11 }} stroke="#44bb44" strokeDasharray="5 5" />
              <ReferenceLine y={150} label={{ value: '150斤', position: 'right', fill: '#6ec6ff', fontSize: 11 }} stroke="#6ec6ff" strokeDasharray="5 5" />
              <ReferenceLine y={140} label={{ value: '140斤', position: 'right', fill: '#c44dff', fontSize: 11 }} stroke="#c44dff" strokeDasharray="5 5" />
              {/* 回归预测线 */}
              <Line type="monotone" dataKey="regression" stroke="#c44dff" strokeWidth={2} strokeDasharray="8 4"
                dot={false} name="regression" />
              {/* 实际体重线 */}
              <Line type="monotone" dataKey="weight" stroke="#ff6b9d" strokeWidth={3}
                dot={{ r: 3, fill: '#ff6b9d', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#c44dff' }}
              />
            </ComposedChart>
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

      {/* 详细记录 - 按月份分组 */}
      <div className="space-y-4">
        <h3 className="font-bold text-base mb-2 flex items-center gap-2" style={{ color: '#4a3548' }}>
          <Calendar className="w-5 h-5" style={{ color: '#ff6b9d' }} />
          详细记录
        </h3>
        {Object.entries(groupedByMonth).sort((a, b) => b[0].localeCompare(a[0])).map(([monthKey, monthRecords]) => (
          <div key={monthKey} className="mb-4">
            {/* 月份标题 */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #ffe0e8, transparent)' }} />
              <span className="text-sm font-bold px-3 py-1 rounded-full"
                style={{ background: 'linear-gradient(135deg, #fff0f5, #f0e6ff)', color: '#ff6b9d' }}>
                {monthNames[monthKey] || monthKey}
              </span>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #ffe0e8)' }} />
            </div>
            {/* 该月记录 */}
            <div className="space-y-2">
              {[...monthRecords].reverse().map((r, i) => {
                const globalIndex = records.findIndex(rec => rec.date === r.date)
                const isEditing = editingId === globalIndex
                return (
                  <div key={r.date} className="rounded-2xl p-3 shadow-sm border-2 transition-all duration-200 hover:shadow-md"
                    style={{ background: i % 2 === 0 ? '#fff' : '#fff8fa', borderColor: '#ffe0e8' }}>
                    <div className="flex items-center gap-3">
                      {/* 日期 - 加宽不换行 */}
                      <div className="shrink-0 text-center" style={{ minWidth: '64px' }}>
                        <div className="text-sm font-bold" style={{ color: '#ff6b9d' }}>
                          {parseISO(r.date).getDate()}日
                        </div>
                        <div className="text-[10px]" style={{ color: '#d4b0c0' }}>
                          周{['日','一','二','三','四','五','六'][parseISO(r.date).getDay()]}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base" style={{ color: '#4a3548' }}>{r.weight} 斤</span>
                          {r.change > 0 && <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ color: '#fff', background: '#ff6b9d' }}>+{r.change}</span>}
                          {r.change < 0 && <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ color: '#fff', background: '#44bb44' }}>{r.change}</span>}
                          {r.change === 0 && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ color: '#a890a0', background: '#f0f0f0' }}>持平</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isEditing ? (
                          <>
                            <Input value={editValue} onChange={e => setEditValue(e.target.value)}
                              className="w-20 h-8 text-sm rounded-xl border-2" style={{ borderColor: '#ff6b9d' }} />
                            <Button size="sm" onClick={() => handleSave(globalIndex)}
                              className="h-8 px-3 rounded-xl text-white border-0 text-xs"
                              style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)' }}>保存</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}
                              className="h-8 px-2 rounded-xl text-xs" style={{ color: '#a890a0' }}>取消</Button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(globalIndex, r.weight)}
                              className="p-1.5 rounded-full hover:bg-pink-50 transition-colors" title="编辑">
                              <Sparkles className="w-3.5 h-3.5" style={{ color: '#d4b0c0' }} />
                            </button>
                            <button onClick={() => handleDelete(globalIndex)}
                              className="p-1.5 rounded-full hover:bg-red-50 transition-colors" title="删除">
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
        ))}
      </div>
    </div>
  )
}
