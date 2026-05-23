import { NextRequest } from 'next/server'
import { chatStream } from '@/lib/ai'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 注入系统提示词（退休计划上下文）
    const systemPrompt = `你是用户的退休计划助理。用户的退休计划 Excel 文件包含以下板块：
- 流水线（网文创作工作流）
- 网文AI模块
- 投资板块（黄金涨跌预测与复盘）
- 网文板块（写作进度跟踪）
- AI板块（AI学习进度）
- 体重板块（体重变化记录）
- 创业板块
- 食谱规划
- 退休时间（倒计时）
- 时间表
- 路线
- 短编
- 全勤
- 翌日计划
- 居民缴费

请根据用户的问题，结合退休计划的数据，给出有用的回答。`

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ]

    const response = await chatStream(fullMessages)

    // 返回 SSE 流
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        const encoder = new TextEncoder()
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          controller.enqueue(value)
        }
        
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('AI chat API error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
