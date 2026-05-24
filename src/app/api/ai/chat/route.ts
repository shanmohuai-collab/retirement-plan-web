import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'messages 数组不能为空' },
        { status: 400 }
      )
    }

    const lastMessage = messages[messages.length - 1]
    const userMessage = lastMessage?.content || ''

    const mockResponse = `收到你的消息："${userMessage}"\n\n我是你的退休计划小助手小退～\n\n这是模拟回复，真实 AI API 配置后会自动切换。\n\n你可以：\n1. 问我体重趋势分析\n2. 问我网文写作建议\n3. 让我帮你制定今日计划`

    const stream = new ReadableStream({
      async start(controller) {
        const startData = `data: ${JSON.stringify({ choices: [{ delta: { content: '' } }] })}\n\n`
        controller.enqueue(new TextEncoder().encode(startData))

        const chars = mockResponse.split('')
        for (const char of chars) {
          const data = `data: ${JSON.stringify({ choices: [{ delta: { content: char } }] })}\n\n`
          controller.enqueue(new TextEncoder().encode(data))
          await new Promise(resolve => setTimeout(resolve, 15))
        }

        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error: any) {
    console.error('AI chat API error:', error)
    return NextResponse.json(
      { error: error.message || '服务器内部错误' },
      { status: 500 }
    )
  }
}
