/**
 * DeepSeek AI API 封装
 * 文档：https://platform.deepseek.com/docs
 */

const DEEPEEK_API_BASE = 'https://api.deepseek.com'
const DEEPEEK_API_KEY = process.env.DEEPSEEK_API_KEY!

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * 流式聊天（Server-Sent Events）
 */
export async function chatStream(messages: ChatMessage[]) {
  const res = await fetch(`${DEEPEEK_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      stream: true,
    }),
  })

  if (!res.ok) {
    throw new Error(`DeepSeek API error: ${res.status} ${await res.text()}`)
  }

  return res
}

/**
 * 非流式聊天（一次性返回）
 */
export async function chat(messages: ChatMessage[]) {
  const res = await fetch(`${DEEPEEK_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      stream: false,
    }),
  })

  if (!res.ok) {
    throw new Error(`DeepSeek API error: ${res.status} ${await res.text()}`)
  }

  return res.json()
}
