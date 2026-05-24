import { NextRequest, NextResponse } from 'next/server'
import { chatStream } from '@/lib/ai'

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

    // 注入系统提示词
    const systemPrompt = `你是用户的退休计划助理，名字叫"小退"。

用户的退休计划 Excel 文件（金山文档）包含以下板块：
- 流水线：网文创作工作流（看文→灵感→导语→大纲→成文→修文→投稿）
- 网文板块：写作进度跟踪（编号、星期、日期、题材、进度、投稿状态）
- 投资板块：黄金涨跌预测与复盘（日期、预测方向、理由、开盘价、收盘价、复盘）
- 体重板块：体重变化记录（日期、体重、变化、备注、是否达标）
- AI板块：AI学习进度
- 创业板块、食谱规划、退休时间倒计时、时间表等

回答要求：
1. 语气亲切，像朋友一样交流
2. 回答简洁实用，不要废话
3. 涉及数据分析时，给出具体建议
4. 如果用户问"帮我写一篇..."，引导用户去 WorkBuddy 操作（你有最专业的网文创作 skill）
5. 当前日期是 2026 年 5 月 24 日`

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ]

    const response = await chatStream(fullMessages)

    // 直接返回 DeepSeek 的 SSE 流，不做任何处理
    return new Response(response.body, {
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
