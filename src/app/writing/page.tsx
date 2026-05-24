'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PenLine, BookOpen, CheckCircle, Sparkles, Trash2, Plus, Minus, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

interface WritingRecord {
  date: string;
  id: string;
  title: string;
  type: string;
  platform: string;
  editor: string;
  wordCount: number;
  pricePerK: string;
  expectedPaymentDate: string;
  paymentAmount: number;
  status: string;
}

interface FullAttendanceRules {
  platforms: {
    [key: string]: {
      rules: {
        [key: string]: number;
      };
      editor: string;
      note: string;
    };
  };
}

const statusMap: Record<string, string> = {
  '构思中': '#6ec6ff',
  '写作中': '#ffb86c',
  '已完成': '#7ee8a2',
  '已投稿': '#c44dff',
  '已到账': '#4caf50',
}

export default function WritingPage() {
  const [records, setRecords] = useState<WritingRecord[]>([])
  const [rules, setRules] = useState<FullAttendanceRules | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [writingRes, rulesRes] = await Promise.all([
        fetch('/data/writing.json'),
        fetch('/data/full-attendance-rules.json'),
      ])
      const writingData = await writingRes.json()
      const rulesData = await rulesRes.json()
      setRecords(writingData)
      setRules(rulesData)
    } catch {
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const stats = {
    total: records.length,
    writing: records.filter(r => r.status === '写作中').length,
    completed: records.filter(r => r.status === '已完成').length,
    submitted: records.filter(r => r.status === '已投稿').length,
    paid: records.filter(r => r.status === '已到账').length,
    totalSalary: records.filter(r => r.status === '已到账').reduce((sum, r) => sum + r.paymentAmount, 0),
  }

  // 全勤奖进度
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const monthlyPlatformCount: Record<string, number> = {}
  records.forEach(r => {
    const date = new Date(r.date)
    if (date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear && r.status === '已到账') {
      monthlyPlatformCount[r.platform] = (monthlyPlatformCount[r.platform] || 0) + 1
    }
  })

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
    <div className="max-w-4xl mx-auto p-4 pb-24">
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
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
        {[
          { label: '总作品', value: stats.total, color: '#ff6b9d', icon: '📚' },
          { label: '写作中', value: stats.writing, color: '#ffb86c', icon: '✍️' },
          { label: '已完成', value: stats.completed, color: '#7ee8a2', icon: '✅' },
          { label: '已投稿', value: stats.submitted, color: '#c44dff', icon: '📤' },
          { label: '已到账', value: stats.paid, color: '#4caf50', icon: '💰' },
          { label: '到账总工资', value: `¥${stats.totalSalary}`, color: '#2196f3', icon: '💵' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-3 shadow-sm border-2"
            style={{ background: '#fff', borderColor: '#ffe0e8' }}>
            <p className="text-xs mb-1" style={{ color: '#a890a0' }}>{s.icon} {s.label}</p>
            <p className="font-bold text-lg" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 全勤奖进度 */}
      {rules && (
        <div className="mb-5">
          <h3 className="font-bold text-lg mb-3" style={{ color: '#4a3548' }}>🏆 全勤奖进度（{currentMonth}月）</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(rules.platforms).map(([platform, rule]) => {
              const count = monthlyPlatformCount[platform] || 0
              const thresholds = Object.keys(rule.rules).map(Number).sort((a, b) => a - b)

              // 当前已达到的奖金（找到所有 <= count 的阈值，取最大）
              const achieved = thresholds.filter(t => t <= count)
              const currentReward = achieved.length > 0 ? rule.rules[Math.max(...achieved)] : 0

              // 下一档目标
              const nextThreshold = thresholds.find(t => t > count)
              const nextReward = nextThreshold ? rule.rules[nextThreshold] : null

              // 进度：到下一档的进度（或 100%）
              const progress = nextThreshold
                ? Math.min(100, (count / nextThreshold) * 100)
                : 100

              const isMax = !nextThreshold && count > 0

              return (
                <div key={platform} className="rounded-2xl p-3 shadow-sm border-2"
                  style={{ background: '#fff', borderColor: '#ffe0e8' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm" style={{ color: '#4a3548' }}>
                      {platform} {rule.editor && <span className="text-xs" style={{color: '#a890a0'}}>({rule.editor})</span>}
                    </span>
                    <span className="text-xs" style={{ color: '#a890a0' }}>
                      {count}篇{nextThreshold ? ` / ${nextThreshold}篇` : ''}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        background: isMax ? '#4caf50' : 'linear-gradient(90deg,#ff6b9d,#c44dff)'
                      }}>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs" style={{ color: '#4a3548' }}>
                      <span className="font-semibold" style={{ color: currentReward > 0 ? '#4caf50' : '#a890a0' }}>
                        已得: ¥{currentReward}
                      </span>
                      {nextReward && (
                        <span style={{ color: '#a890a0' }}> → 下一档: ¥{nextReward}</span>
                      )}
                      {isMax && (
                        <span style={{ color: '#4caf50' }}> (已满)</span>
                      )}
                    </p>
                    {rule.note && <p className="text-xs" style={{ color: '#a890a0' }}>{rule.note}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 作品列表 */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg mb-3" style={{ color: '#4a3548' }}>📖 作品列表</h3>
        {records.map((r, i) => (
          <div key={r.id} className="rounded-2xl p-4 shadow-sm border-2 transition-all duration-200 hover:shadow-md"
            style={{ background: i % 2 === 0 ? '#fff' : '#fff8fa', borderColor: '#ffe0e8' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg,#fff0f5,#f0e6ff)', color: '#ff6b9d' }}>
                {r.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm" style={{ color: '#4a3548' }}>{r.title}</span>
                  <Badge className="rounded-full text-xs border-0"
                    style={{ background: statusMap[r.status] + '33', color: statusMap[r.status] }}>
                    {r.status}
                  </Badge>
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#a890a0' }}>{r.type} · {r.platform} · {r.editor}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs" style={{ color: '#a890a0' }}>
              <div>📅 {r.date}</div>
              <div>📝 {r.wordCount}字</div>
              <div>💰 {r.pricePerK} (¥{r.paymentAmount})</div>
              <div>📅 预计到账: {r.expectedPaymentDate}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
