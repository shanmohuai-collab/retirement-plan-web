'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Newspaper,
  Bot,
  Sparkles,
  TrendingUp,
  Globe,
  Cpu,
  Code2,
  Eye,
  Calendar,
  Tag,
  ExternalLink,
  RefreshCw,
  Lightbulb,
  BookOpen,
  Zap,
  Send,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

// ==================== 类型定义 ====================
interface AINews {
  id: number
  date: string
  title: string
  summary: string
  source: string
  url: string
  category: string
  tags: string[]
}

type Message = { role: 'user' | 'assistant'; content: string }

// ==================== 图标和颜色配置 ====================
const categoryIcons: Record<string, React.ReactElement> = {
  '大模型': <Bot className="w-4 h-4" />,
  '生成式AI': <Sparkles className="w-4 h-4" />,
  '开源模型': <Code2 className="w-4 h-4" />,
  '应用落地': <Zap className="w-4 h-4" />,
  '硬件': <Cpu className="w-4 h-4" />,
  '可解释性': <Eye className="w-4 h-4" />,
  'AI Agent': <Bot className="w-4 h-4" />,
}

const categoryColors: Record<string, string> = {
  '大模型': 'bg-purple-100 text-purple-700 border-purple-200',
  '生成式AI': 'bg-pink-100 text-pink-700 border-pink-200',
  '开源模型': 'bg-green-100 text-green-700 border-green-200',
  '应用落地': 'bg-blue-100 text-blue-700 border-blue-200',
  '硬件': 'bg-orange-100 text-orange-700 border-orange-200',
  '可解释性': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'AI Agent': 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

// ==================== 主组件 ====================
export default function AIPage() {
  const [activeTab, setActiveTab] = useState<'news' | 'chat'>('news')

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'linear-gradient(135deg, #f5f0ff, #fff5f7)' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 标题区 + 标签页切换 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #ff6b9d, #c44dff)' }}>
              🤖
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AI 前沿</h1>
              <p className="text-sm text-gray-500">每日更新 · 最前沿的 AI 资讯</p>
            </div>
          </div>

          {/* 标签页切换 */}
          <div className="flex items-center gap-2 bg-white rounded-2xl p-1 shadow-md">
            <Button
              variant={activeTab === 'news' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('news')}
              className={`rounded-xl ${activeTab === 'news' ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-purple-50'}`}
            >
              <Newspaper className="w-4 h-4 mr-2" />
              前沿新闻
            </Button>
            <Button
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('chat')}
              className={`rounded-xl ${activeTab === 'chat' ? 'bg-pink-600 hover:bg-pink-700' : 'hover:bg-pink-50'}`}
            >
              <Bot className="w-4 h-4 mr-2" />
              AI 小助手
            </Button>
          </div>
        </div>

        {/* 根据标签页渲染内容 */}
        {activeTab === 'news' ? <NewsTab /> : <ChatTab />}
      </div>
    </div>
  )
}

// ==================== 新闻标签页 ====================
function NewsTab() {
  const [news, setNews] = useState<AINews[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')
  const [selectedDate, setSelectedDate] = useState<string>('全部')
  const [summarizing, setSummarizing] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    fetch('/data/ai-news.json')
      .then(res => res.json())
      .then(data => {
        setNews(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load AI news:', err)
        setLoading(false)
      })
  }, [])

  // 获取所有分类
  const categories = ['全部', ...Array.from(new Set(news.map(n => n.category)))]
  // 获取所有日期（去重并排序）
  const dates = ['全部', ...Array.from(new Set(news.map(n => n.date))).sort().reverse()]

  // 筛选新闻
  const filteredNews = news.filter(n => {
    const matchCategory = selectedCategory === '全部' || n.category === selectedCategory
    const matchDate = selectedDate === '全部' || n.date === selectedDate
    return matchCategory && matchDate
  })

  // 按日期分组
  const groupedNews = filteredNews.reduce<Record<string, AINews[]>>((acc, n) => {
    if (!acc[n.date]) acc[n.date] = []
    acc[n.date].push(n)
    return acc
  }, {})

  // 统计信息
  const stats = {
    total: news.length,
    today: news.filter(n => n.date === new Date().toISOString().split('T')[0]).length,
    categories: Array.from(new Set(news.map(n => n.category))).length,
    sources: Array.from(new Set(news.map(n => n.source))).length,
  }

  // AI 总结功能
  const generateSummary = async (type: 'today' | 'week' | 'all') => {
    setSummarizing(true)
    setShowSummary(true)
    setSummary('')

    let targetNews: AINews[] = []
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    if (type === 'today') {
      targetNews = news.filter(n => n.date === today)
    } else if (type === 'week') {
      targetNews = news.filter(n => n.date >= weekAgo)
    } else {
      targetNews = news
    }

    if (targetNews.length === 0) {
      setSummary('暂无相关新闻数据')
      setSummarizing(false)
      return
    }

    try {
      const prompt = `请总结以下 AI 新闻，提取关键趋势和亮点：\n\n${
        targetNews.map(n => `- ${n.title}（${n.category}）：${n.summary}`).join('\n')
      }\n\n请提供一个简洁的总结（200字以内），包括：1. 主要趋势；2. 重要突破；3. 值得关注的方向。`

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        }),
      })

      if (!response.ok) throw new Error('请求失败')

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.trim())

        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const json = line.slice(5).trim()
          if (json === '[DONE]') continue
          try {
            const parsed = JSON.parse(json)
            const token = parsed.choices?.[0]?.delta?.content
            if (token) {
              fullContent += token
              setSummary(fullContent)
            }
          } catch {}
        }
      }
    } catch (err) {
      toast.error('总结生成失败，请重试')
      console.error(err)
    } finally {
      setSummarizing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-spin"
            style={{ background: 'linear-gradient(135deg, #ff6b9d, #c44dff)' }}>
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-500">加载 AI 新闻中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '新闻总数', value: stats.total, icon: <Newspaper className="w-5 h-5" />, color: 'from-purple-400 to-purple-600' },
          { label: '今日新闻', value: stats.today, icon: <Calendar className="w-5 h-5" />, color: 'from-pink-400 to-pink-600' },
          { label: '覆盖分类', value: stats.categories, icon: <Tag className="w-5 h-5" />, color: 'from-blue-400 to-blue-600' },
          { label: '信息来源', value: stats.sources, icon: <Globe className="w-5 h-5" />, color: 'from-green-400 to-green-600' },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 筛选区 + AI 总结按钮 */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">分类筛选</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-lg text-xs ${
                        selectedCategory === cat
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {cat !== '全部' && categoryIcons[cat]}
                      <span className="ml-1">{cat}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">日期筛选</label>
                <div className="flex flex-wrap gap-2">
                  {dates.map(date => (
                    <Button
                      key={date}
                      variant={selectedDate === date ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDate(date)}
                      className={`rounded-lg text-xs ${
                        selectedDate === date
                          ? 'bg-pink-600 hover:bg-pink-700'
                          : 'border-pink-200 text-pink-600 hover:bg-pink-50'
                      }`}
                    >
                      {date}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI 总结区 */}
            <div className="md:w-72 space-y-2">
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                <Lightbulb className="w-4 h-4 inline mr-1" />
                AI 智能总结
              </label>
              <div className="space-y-2">
                <Button
                  onClick={() => generateSummary('today')}
                  disabled={summarizing}
                  className="w-full rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  总结今日新闻
                </Button>
                <Button
                  onClick={() => generateSummary('week')}
                  disabled={summarizing}
                  variant="outline"
                  className="w-full rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50 text-xs"
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  总结本周趋势
                </Button>
                <Button
                  onClick={() => generateSummary('all')}
                  disabled={summarizing}
                  variant="outline"
                  className="w-full rounded-lg border-pink-200 text-pink-600 hover:bg-pink-50 text-xs"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  总结全部新闻
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI 总结结果 */}
      {showSummary && (
        <Card className="border-0 shadow-lg" style={{ borderLeft: '4px solid #c44dff' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI 总结
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSummary(false)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summarizing ? (
              <div className="flex items-center gap-2 text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI 正在总结中...</span>
              </div>
            ) : (
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 新闻列表 */}
      <div className="space-y-6">
        {Object.entries(groupedNews).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-700">{date}</h2>
              <Badge variant="secondary" className="text-xs">{items.length} 条</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {items.map(item => (
                <Card key={item.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`text-xs ${categoryColors[item.category] || 'bg-gray-100 text-gray-700'}`}>
                        <span className="flex items-center gap-1">
                          {categoryIcons[item.category]}
                          {item.category}
                        </span>
                      </Badge>
                      <span className="text-xs text-gray-400">{item.source}</span>
                    </div>

                    <h3 className="font-semibold text-gray-800 mb-2 leading-snug">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-purple-600 transition-colors"
                      >
                        {item.title}
                      </a>
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-3">
                      {item.summary}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs border-gray-200 text-gray-500">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        阅读原文
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 无结果提示 */}
      {filteredNews.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无符合条件的新闻</p>
            <Button
              variant="link"
              onClick={() => { setSelectedCategory('全部'); setSelectedDate('全部') }}
              className="text-purple-600"
            >
              清除筛选条件
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}

// ==================== 聊天标签页 ====================
function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '🎐 你好呀！我是你的退休计划小助手小退～\n有什么想聊的、想分析的，尽管说吧！' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput('')
    const userMsg: Message = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setTyping(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        }),
      })
      if (!res.ok) throw new Error('请求失败')
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])
      setTyping(false)
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.trim())
        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const json = line.slice(5).trim()
          if (json === '[DONE]') continue
          try {
            const parsed = JSON.parse(json)
            const token = parsed.choices?.[0]?.delta?.content
            if (token) {
              fullContent += token
              setMessages(prev => {
                const next = [...prev]
                next[next.length - 1] = { role: 'assistant', content: fullContent }
                return next
              })
            }
          } catch {}
        }
      }
    } catch {
      toast.error('😢 出错了，请重试')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
      setTyping(false)
    }
  }

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: '🎐 你好呀！我是你的退休计划小助手小退～\n有什么想聊的、想分析的，尽管说吧！' }])
    toast.success('🧹 聊天记录已清空！')
  }

  const quickActions = [
    { label: '📊 分析体重趋势', prompt: '帮我分析最近的体重变化趋势，给出建议' },
    { label: '📝 网文写作建议', prompt: '帮我分析最近网文创作进度，给一些写作建议' },
    { label: '🎯 今日计划', prompt: '根据我的退休计划，帮我制定今天的行动计划' },
  ]

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      {/* 聊天区 */}
      <Card className="flex-1 overflow-hidden flex flex-col border-0 shadow-lg"
        style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)' }}>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs mr-2 shrink-0 mt-1 shadow-sm"
                  style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)' }}>
                  🤖
                </div>
              )}
              <div className={`max-w-[82%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'text-white rounded-t-2xl rounded-bl-2xl rounded-br-md'
                  : 'rounded-t-2xl rounded-br-2xl rounded-bl-md'
              }`}
                style={{
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg,#ff6b9d,#c44dff)'
                    : 'linear-gradient(135deg,#fff5f7,#fff0ff)',
                  color: m.role === 'user' ? '#fff' : '#4a3548',
                  border: m.role === 'assistant' ? '1.5px solid #ffe0e8' : 'none',
                  boxShadow: m.role === 'user' ? '0 4px 20px rgba(255,107,157,0.25)' : '0 2px 12px rgba(255,107,157,0.08)',
                }}>
                {m.content.split('\n').map((line, j) => (
                  <p key={j}>{line || '\u200B'}</p>
                ))}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs ml-2 shrink-0 mt-1 shadow-sm"
                  style={{ background: 'linear-gradient(135deg,#6ec6ff,#c44dff)', boxShadow: '0 4px 16px rgba(110,198,255,0.3)' }}>
                  🙋
                </div>
              )}
            </div>
          ))}

          {/* 思考中动画 */}
          {typing && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs mr-2 shrink-0 shadow-sm"
                style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)' }}>🤖</div>
              <div className="rounded-t-2xl rounded-br-2xl rounded-bl-md px-4 py-3"
                style={{ background: 'linear-gradient(135deg,#fff5f7,#fff0ff)', border: '1.5px solid #ffe0e8' }}>
                <div className="flex items-center gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        background: 'linear-gradient(135deg,#ff6b9d,#c44dff)',
                        animationDelay: `${i*0.15}s`,
                        animationDuration: '0.6s',
                      }} />
                  ))}
                  <span className="text-xs ml-1" style={{ color: '#d4b0c0' }}>思考中</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>

        {/* 快捷按钮 */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {quickActions.map((a, i) => (
              <button key={i} onClick={() => sendMessage(a.prompt)}
                className="text-xs px-3 py-1.5 border transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  borderRadius: '999px',
                  borderColor: '#ffe0e8',
                  background: 'rgba(255,255,255,0.8)',
                  color: '#a890a0',
                }}>
                {a.label}
              </button>
            ))}
          </div>
        )}

        {/* 输入框 */}
        <div className="p-3" style={{ borderTop: '2px solid #ffe0e8' }}>
          <div className="flex gap-2 items-center">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="说点什么吧～ 💬"
              disabled={loading}
              className="flex-1 h-11 text-sm border-2 focus:border-pink-300"
              style={{ borderRadius: '999px', borderColor: '#ffe0e8', background: '#fff5f7' }}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-11 h-11 p-0 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                borderRadius: '50%',
                background: (!input.trim() || loading)
                  ? 'linear-gradient(135deg,#d4b0c0,#d4b0c0)'
                  : 'linear-gradient(135deg,#ff6b9d,#c44dff)',
                boxShadow: '0 4px 20px rgba(255,107,157,0.3)',
              }}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* 清空按钮 */}
      <div className="flex justify-end mt-2">
        <Button variant="ghost" size="sm" onClick={clearChat}
          className="rounded-full text-xs" style={{ color: '#d4b0c0' }} title="清空聊天">
          <Trash2 className="w-3 h-3 mr-1" />
          清空聊天
        </Button>
      </div>
    </div>
  )
}
