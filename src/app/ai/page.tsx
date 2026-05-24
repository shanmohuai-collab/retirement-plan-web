'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, Bot, User, Sparkles, RotateCw, Trash2, Heart } from 'lucide-react'
import { toast } from 'sonner'

type Message = { role: 'user' | 'assistant'; content: string }

const quickActions = [
  { label: '📊 分析体重趋势', prompt: '帮我分析最近的体重变化趋势，给出建议' },
  { label: '📝 网文写作建议', prompt: '帮我分析最近网文创作进度，给一些写作建议' },
  { label: '💰 投资复盘', prompt: '帮我复盘最近的投资预测，分析准确率' },
  { label: '🎯 今日计划', prompt: '根据我的退休计划，帮我制定今天的行动计划' },
]

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '🎐 你好呀！我是你的退休计划小助手～\n有什么想聊的、想分析的，尽管说吧！' }
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
    setMessages([{ role: 'assistant', content: '🎐 你好呀！我是你的退休计划小助手～\n有什么想聊的、想分析的，尽管说吧！' }])
    toast.success('🧹 聊天记录已清空！')
  }

  return (
    <div className="max-w-2xl mx-auto p-4 h-[calc(100vh-3.5rem)] flex flex-col">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-md"
            style={{ background: 'linear-gradient(135deg,#ff6b9d,#c44dff)', boxShadow: '0 4px 16px rgba(255,107,157,0.3)' }}>
            🤖
          </div>
          <div>
            <h2 className="font-bold text-base" style={{ color: '#4a3548' }}>AI 小助手</h2>
            <p className="text-xs" style={{ color: '#a890a0' }}>✨ 随时为你服务～</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={clearChat}
            className="rounded-full w-8 h-8" style={{ color: '#d4b0c0' }} title="清空聊天">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

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
    </div>
  )
}
