'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Newspaper, Lightbulb, Sparkles, BookOpen, Globe, Tag, Calendar, RefreshCw, MessageCircle, Bot, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

interface NewsItem {
  id: number
  date: string
  title: string
  summary: string
  source: string
  url: string
  category: string
  tags: string[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const categoryIcons: Record<string, string> = {
  '大模型': '🤖',
  '生成式AI': '🎨',
  '开源模型': '🔓',
  '应用落地': '🚀',
  '硬件': '💻',
  '可解释性': '🔍',
  'AI Agent': '🤝',
}

const today = new Date().toISOString().split('T')[0]
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

export default function AIPage() {
  const [activeTab, setActiveTab] = useState<'news' | 'chat'>('news')
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedDate, setSelectedDate] = useState('全部')
  const [summarizing, setSummarizing] = useState(false)
  const [summary, setSummary] = useState('')

  // 聊天相关
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '你好呀～我是小退，你的退休计划小助手！有什么可以帮你的吗？😊' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const loadNews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/data/ai-news.json')
      const data = await res.json()
      setNews(data)
    } catch {
      toast.error('加载 AI 新闻失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (activeTab === 'news') loadNews() }, [activeTab, loadNews])

  const categories = ['全部', ...Array.from(new Set(news.map(n => n.category)))]
  const dates = ['全部', ...Array.from(new Set(news.map(n => n.date))).sort().reverse()]

  const filteredNews = news.filter(n => {
    if (selectedCategory !== '全部' && n.category !== selectedCategory) return false
    if (selectedDate !== '全部' && n.date !== selectedDate) return false
    return true
  })

  const stats = {
    total: news.length,
    today: news.filter(n => n.date === today).length,
    categories: categories.length - 1,
    sources: new Set(news.map(n => n.source)).size,
  }

  // 发送聊天消息
  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMsg: ChatMessage = { role: 'user', content: inputMessage }
    const newMessages = [...chatMessages, userMsg]
    setChatMessages(newMessages)
    setInputMessage('')
    setChatLoading(true)

    // 添加空的助手消息（用于流式更新）
    setChatMessages([...newMessages, { role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
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
              setChatMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: fullContent }
                return updated
              })
            }
          } catch {}
        }
      }
    } catch (err) {
      toast.error('发送失败，请重试')
      console.error(err)
      // 移除空的助手消息
      setChatMessages(prev => prev.slice(0, -1))
    } finally {
      setChatLoading(false)
    }
  }

  // AI 总结
  const generateSummary = async (type: 'today' | 'week' | 'all') => {
    setSummarizing(true)
    setSummary('')

    let prompt = ''
    const filtered = type === 'today'
      ? news.filter(n => n.date === today)
      : type === 'week'
      ? news.filter(n => n.date >= oneWeekAgo)
      : news

    if (filtered.length === 0) {
      toast.error('没有可总结的新闻')
      setSummarizing(false)
      return
    }

    prompt = `请总结以下 AI 新闻：\n\n${filtered.map(n => `- ${n.title}：${n.summary}`).join('\n')}`

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
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
    } catch {
      toast.error('总结生成失败，请重试')
    } finally {
      setSummarizing(false)
    }
  }

  if (loading && activeTab === 'news') {
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
    <div className="max-w-4xl mx-auto p-4 pb-24">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-md"
          style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', boxShadow: '0 4px 20px rgba(167,139,250,0.3)' }}>
          📰
        </div>
        <div>
          <h2 className="font-bold text-xl" style={{ color: '#4a3548' }}>AI 前沿</h2>
          <p className="text-xs" style={{ color: '#a890a0' }}>✨ 每日最新 AI 资讯 ✨</p>
        </div>
      </div>

      {/* 标签页切换 */}
      <div className="flex gap-2 mb-5">
        <Button
          onClick={() => setActiveTab('news')}
          className={`rounded-lg text-xs ${activeTab === 'news' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white border border-purple-200 text-purple-600 hover:bg-purple-50'}`}
        >
          <Newspaper className="w-3 h-3 mr-1" />
          前沿新闻
        </Button>
        <Button
          onClick={() => setActiveTab('chat')}
          className={`rounded-lg text-xs ${activeTab === 'chat' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white border border-purple-200 text-purple-600 hover:bg-purple-50'}`}
        >
          <Bot className="w-3 h-3 mr-1" />
          AI 小助手
        </Button>
      </div>

      {/* 新闻标签内容 */}
      {activeTab === 'news' && (
        <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
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
          <Card className="border-0 shadow-md mb-5">
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
                          className={`rounded-lg text-xs ${selectedCategory === cat ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-200 text-purple-600 hover:bg-purple-50'}`}
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
                          className={`rounded-lg text-xs ${selectedDate === date ? 'bg-pink-600 hover:bg-pink-700' : 'border-pink-200 text-pink-600 hover:bg-pink-50'}`}
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
                      className="w-full rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50 text-xs"
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      总结全部新闻
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI 总结结果 */}
          {summary && (
            <Card className="border-0 shadow-md mb-5" style={{ borderLeft: '4px solid #a78bfa' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" style={{ color: '#a78bfa' }} />
                  AI 总结
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{summary}</div>
              </CardContent>
            </Card>
          )}

          {/* 新闻列表 */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg" style={{ color: '#4a3548' }}>📰 新闻列表</h3>
            {filteredNews.length === 0 ? (
              <p className="text-gray-400 text-sm">暂无符合条件的新闻</p>
            ) : (
              filteredNews.map(item => (
                <Card key={item.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="text-xs" style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', color: '#fff' }}>
                        {categoryIcons[item.category]} {item.category}
                      </Badge>
                      <span className="text-xs" style={{ color: '#a890a0' }}>{item.source}</span>
                    </div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="font-semibold text-base mb-2 block hover:underline" style={{ color: '#4a3548' }}>
                      {item.title}
                    </a>
                    <p className="text-sm text-gray-600 mb-2 leading-relaxed">{item.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs border-purple-200 text-purple-600">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: '#a890a0' }}>{item.date}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* 聊天标签内容 */}
      {activeTab === 'chat' && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col h-[60vh]">
              {/* 聊天记录 */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                      {msg.content || (i === chatMessages.length - 1 && chatLoading ? '思考中...' : '')}
                    </div>
                  </div>
                ))}
              </div>

              {/* 快捷按钮 */}
              <div className="flex flex-wrap gap-2 mb-3">
                {['分析体重趋势', '网文写作建议', '今日计划'].map(btn => (
                  <Button
                    key={btn}
                    variant="outline"
                    size="sm"
                    onClick={() => { setInputMessage(btn); }}
                    className="rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50 text-xs"
                  >
                    {btn}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setChatMessages([{ role: 'assistant', content: '你好呀～我是小退，你的退休计划小助手！有什么可以帮你的吗？😊' }]) }}
                  className="rounded-lg border-red-200 text-red-500 hover:bg-red-50 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  清空记录
                </Button>
              </div>

              {/* 输入框 */}
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="输入消息..."
                  className="rounded-lg border-purple-200 focus:border-purple-400 text-sm"
                />
                <Button
                  onClick={sendMessage}
                  disabled={chatLoading || !inputMessage.trim()}
                  className="rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
