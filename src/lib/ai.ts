/**
 * DeepSeek AI API 封装
 * 文档：https://platform.deepseek.com/docs
 */

const DEEPSEEK_API_BASE = 'https://api.deepseek.com'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * 流式聊天（Server-Sent Events）
 * 返回原始 Response（SSE stream）
 */
export async function chatStream(messages: ChatMessage[]) {
  const res = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      stream: true,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`DeepSeek API 错误: ${res.status} ${text}`)
  }

  return res
}

/**
 * 非流式聊天（一次性返回）
 */
export async function chat(messages: ChatMessage[]) {
  const res = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      stream: false,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`DeepSeek API 错误: ${res.status} ${text}`)
  }

  return res.json()
}
