'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

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

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

export default function AIPage() {
  const [activeTab, setActiveTab] = useState<'news' | 'chat'>('news')
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { role: 'assistant', content: '你好呀～我是小退，你的退休计划小助手！有什么可以帮你的吗？😊' }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMsgs])

  const loadNews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/data/ai-news.json')
      const data = await res.json()
      setNews(data)
    } catch {
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'news') loadNews()
  }, [activeTab])

  const send = async () => {
    if (!input.trim() || sending) return
    const userMsg: ChatMsg = { role: 'user', content: input }
    const newMsgs = [...chatMsgs, userMsg]
    setChatMsgs(newMsgs)
    setInput('')
    setSending(true)
    // Add empty assistant msg for streaming
    setChatMsgs([...newMsgs, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })) }),
      })

      if (!res.ok) throw new Error('request failed')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''

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
            const obj = JSON.parse(json)
            const token = obj.choices?.[0]?.delta?.content
            if (token) {
              full += token
              setChatMsgs(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: full }
                return updated
              })
            }
          } catch {}
        }
      }
    } catch (e) {
      toast.error('发送失败')
      setChatMsgs(prev => prev.slice(0, -1))
    } finally {
      setSending(false)
    }
  }

  if (loading && activeTab === 'news') {
    return <div className="p-8 text-center text-gray-400">加载中...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">📰 AI 前沿</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'news' ? 'default' : 'outline'}
          onClick={() => setActiveTab('news')}
          className={activeTab === 'news' ? 'bg-purple-600' : ''}
        >前沿新闻</Button>
        <Button
          variant={activeTab === 'chat' ? 'default' : 'outline'}
          onClick={() => setActiveTab('chat')}
          className={activeTab === 'chat' ? 'bg-purple-600' : ''}
        ><Bot className="w-4 h-4 mr-1" />AI 小助手</Button>
      </div>

      {/* News Tab */}
      {activeTab === 'news' && (
        <div className="space-y-3">
          {news.length === 0 && <p className="text-gray-400">暂无新闻</p>}
          {news.map(item => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <a href={item.url} target="_blank" rel="noreferrer"
                  className="font-semibold text-purple-700 hover:underline">
                  {item.title}
                </a>
                <p className="text-sm text-gray-600 mt-1">{item.summary}</p>
                <p className="text-xs text-gray-400 mt-1">{item.source} · {item.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <Card>
          <CardContent className="p-4">
            <div className="h-[55vh] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-2">
                {chatMsgs.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      m.role === 'user'
                        ? 'bg-purple-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      {m.content || (i === chatMsgs.length - 1 && sending ? '思考中...' : '')}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Quick buttons */}
              <div className="flex flex-wrap gap-2 mb-3">
                {['分析体重趋势', '网文写作建议', '今日计划'].map(btn => (
                  <Button key={btn} variant="outline" size="sm" onClick={() => setInput(btn)}
                    className="text-xs border-purple-200 text-purple-600">
                    {btn}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setChatMsgs([
                  { role: 'assistant', content: '你好呀～我是小退，你的退休计划小助手！有什么可以帮你的吗？😊' }
                ])} className="text-xs border-red-200 text-red-500">
                  <Trash2 className="w-3 h-3 mr-1" />清空
                </Button>
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                  placeholder="输入消息..."
                  className="flex-1 border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                />
                <Button onClick={send} disabled={sending || !input.trim()}
                  className="bg-purple-500 hover:bg-purple-600 text-white">
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
