import { NextRequest, NextResponse } from 'next/server'
import { chatStream } from '@/lib/ai'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })
    }

    // 注入系统提示词
    const systemPrompt = `你是用户的退休计划助理，名字叫"小退"。

用户的退休计划包含以下板块：
- 体重板块：体重变化记录
- 网文板块：写作进度跟踪（作品名、类型、字数、单价、投稿平台、状态）
- AI前沿：每日 AI 新闻跟踪
- 全勤板块：各平台全勤奖规则
- 创业板块、食谱规划、退休时间倒计时、时间表等

回答要求：
1. 语气亲切，像朋友一样交流
2. 回答简洁实用，不要废话
3. 涉及数据分析时，给出具体建议
4. 如果用户问"帮我写一篇..."，引导用户去 WorkBuddy 操作
5. 当前日期是 2026 年 5 月 24 日`

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ]

    const response = await chatStream(fullMessages as any)

    // 直接转发 DeepSeek 的 SSE 流
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
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
