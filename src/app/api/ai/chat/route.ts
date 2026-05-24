import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    const userText = lastMessage?.content || ''

    const reply = `你好！我是小退。你说的是："${userText}"。我现在用的是模拟回复，配置好 API 后会切换为真实 AI。`

    // Build SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        // Send each char as SSE
        const send = (text: string) => {
          const data = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`
          controller.enqueue(new TextEncoder().encode(data))
        }

        // Start event
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content: '' } }] })}\n\n`))

        for (const char of reply) {
          send(char)
          await new Promise(r => setTimeout(r, 15))
        }

        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
