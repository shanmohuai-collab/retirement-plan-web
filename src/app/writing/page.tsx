'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PenLine, BookOpen, CheckCircle, Sparkles, Trash2, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

interface WritingRecord { id: number; date: string; topic: string; progress: string; status: string }

const statusMap: Record<string, string> = {
  '构思中': '#6ec6ff',
  '写作中': '#ffb86c',
  '已完成': '#7ee8a2',
  '已投稿': '#c44dff',
}

export default function WritingPage() {
  const [records, setRecords] = useState<WritingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTopic, setNewTopic] = useState('')
  const [newProgress, setNewProgress] = useState('')
  const [newStatus, setNewStatus] = useState('构思中')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/data/writing.json')
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
    setRecords(prev => prev.map(r => r.id === id ? { ...r, progress: editValue } : r))
    setEditingId(null)
    toast.success('💖 已更新！')
    localStorage.setItem('writing-records', JSON.stringify(records))
  }

  const handleAdd = () => {
    if (!newDate || !newTopic) { toast.error('请填写日期和题材'); return }
    const newRec: WritingRecord = {
      id: records.length ? Math.max(...records.map(r => r.id)) + 1 : 1,
      date: newDate, topic: newTopic, progress: newProgress, status: newStatus,
    }
    setRecords(prev => [...prev, newRec])
    setNewDate(''); setNewTopic(''); setNewProgress(''); setShowAdd(false)
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

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      {/* 标题卡片 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-md"
          style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)', boxShadow: '0 4px 20px rgba(255,107,157,0.3)' }}>
          📝
        </div>
        <div>
          <h2 className="font-bold text-xl" style={{ color: '#4a3548' }}>网文创作</h2>
          <p className="text-xs" style={{ color: '#a890a0' }}>✨ 每一篇都是心血 ✨</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { localStorage.setItem('writing-records', JSON.stringify(records)); toast.success('💾 已保存') }}
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
          { label: '总作品', value: records.length, color: '#ff6b9d' },
          { label: '写作中', value: records.filter(r => r.status === '写作中').length, color: '#ffb86c' },
          { label: '已完成', value: records.filter(r => r.status === '已完成').length, color: '#7ee8a2' },
          { label: '已投稿', value: records.filter(r => r.status === '已投稿').length, color: '#c44dff' },
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
              <p className="text-xs mb-1" style={{ color: '#a890a0' }}>题材</p>
              <Input value={newTopic} onChange={e => setNewTopic(e.target.value)}
                placeholder="言情/悬疑/世情" className="rounded-xl border-2" style={{ borderColor: '#ffe0e8', background: '#fff' }} />
            </div>
          </div>
          <div className="mb-2">
            <p className="text-xs mb-1" style={{ color: '#a890a0' }}>进度</p>
            <Input value={newProgress} onChange={e => setNewProgress(e.target.value)}
              placeholder="第3章/修文中" className="rounded-xl border-2" style={{ borderColor: '#ffe0e8', background: '#fff' }} />
          </div>
          <div className="flex gap-2 items-center">
            {['构思中','写作中','已完成','已投稿'].map(s => (
              <button key={s} onClick={() => setNewStatus(s)}
                className="px-3 py-1 text-xs rounded-full border-2 transition-all"
                style={{
                  borderColor: newStatus === s ? statusMap[s] : '#ffe0e8',
                  background: newStatus === s ? statusMap[s] + '22' : 'transparent',
                  color: newStatus === s ? statusMap[s] : '#a890a0',
                }}>
                {s}
              </button>
            ))}
            <Button size="sm" onClick={handleAdd}
              className="ml-auto text-white border-0 rounded-xl text-xs"
              style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)' }}>
              确认
            </Button>
          </div>
        </div>
      )}

      {/* 记录列表 */}
      <div className="space-y-2">
        {records.map((r, i) => {
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
                    <span className="font-semibold text-sm" style={{ color: '#4a3548' }}>{r.topic}</span>
                    <Badge className="rounded-full text-xs border-0"
                      style={{ background: statusMap[r.status] + '33', color: statusMap[r.status] }}>
                      {r.status}
                    </Badge>
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#a890a0' }}>{r.progress}</p>
                </div>
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <Input value={editValue} onChange={e => setEditValue(e.target.value)}
                        className="w-32 h-8 text-xs rounded-xl border-2" style={{ borderColor: '#ff6b9d' }} />
                      <Button size="sm" onClick={() => handleSave(r.id)}
                        className="h-8 px-3 rounded-xl text-white border-0 text-xs"
                        style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)' }}>保存</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}
                        className="h-8 px-2 rounded-xl text-xs" style={{ color: '#a890a0' }}>取消</Button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(r.id); setEditValue(r.progress) }}
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
