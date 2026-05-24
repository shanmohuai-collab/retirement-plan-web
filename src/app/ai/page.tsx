'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Send, User, Bot, Trash2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`API 错误: ${response.status} ${errText}`)
      }

      // 正确的 SSE 解析
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      // 先添加一个空的助手消息
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      if (reader) {
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''  // 最后一行可能不完整

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            
            const data = trimmed.slice(5).trim()  // 去掉 'data:' 和前后空格
            if (data === '[DONE]' || data === 'done') continue
            
            try {
              const json = JSON.parse(data)
              const content = json.choices?.[0]?.delta?.content
              if (content) {
                assistantContent += content
                setMessages(prev => {
                  const next = [...prev]
                  next[next.length - 1] = {
                    ...next[next.length - 1],
                    content: assistantContent,
                  }
                  return next
                })
              }
            } catch (e) {
              // 忽略解析错误（心跳包等）
            }
          }
        }
      }
    } catch (error: any) {
      toast.error(`发送失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([])
    toast.success('对话已清空')
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI 助理</h1>
            <p className="text-sm text-gray-500">退休计划小助手 · 小退</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat} className="text-gray-500 hover:text-red-500">
            <Trash2 className="w-4 h-4 mr-1" />
            清空
          </Button>
        )}
      </div>

      {/* 聊天区域 */}
      <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-lg font-medium">你好！我是小退</p>
              <p className="text-sm mt-1">你的退休计划助理，有什么可以帮你的？</p>
              <div className="flex gap-2 mt-4">
                {['我的体重进度如何？', '帮我分析最近的投资', '给我一个写作建议'].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-blue-50 rounded-full text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* 头像 */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-green-500 to-teal-500'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}>
                {msg.role === 'user'
                  ? <User className="w-4 h-4 text-white" />
                  : <Bot className="w-4 h-4 text-white" />
                }
              </div>

              {/* 消息气泡 */}
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-md'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-md'
              }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* 思考中动画 */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>

        {/* 输入区域 */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="输入你的问题...（Enter 发送）"
              disabled={loading}
              className="flex-1 h-11 rounded-full border-gray-200 bg-white px-5 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-0 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">
            小退可能会出错，重要决策请结合实际情况判断
          </p>
        </div>
      </Card>
    </div>
  )
}
