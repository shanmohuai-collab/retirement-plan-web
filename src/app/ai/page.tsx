'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      const assistantMessage: Message = { role: 'assistant', content: '' }
      setMessages(prev => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const json = JSON.parse(data)
                const content = json.choices?.[0]?.delta?.content || ''
                assistantContent += content
                setMessages(prev => {
                  const newMessages = [...prev]
                  newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: assistantContent,
                  }
                  return newMessages
                })
              } catch (e) {
                // 忽略解析错误
              }
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

  if (!isClient) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">AI 助理</h1>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>退休计划助理</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              你好！我是你的退休计划助理。有什么可以帮你的吗？
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-900">
                思考中...
              </div>
            </div>
          )}
        </CardContent>
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="输入你的问题..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              发送
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
