/**
 * 金山文档 API 封装
 * 文档：https://developer.kdocs.cn/server/guide/api-overview.html
 */

const KDOCS_API_BASE = 'https://developer.kdocs.cn/api/v1/openapi'
const FILE_TOKEN = process.env.KDOCS_FILE_TOKEN!
const ACCESS_TOKEN = process.env.KDOCS_ACCESS_TOKEN!

/**
 * 获取所有 sheet 信息
 */
export async function getSheets() {
  const res = await fetch(`${KDOCS_API_BASE}/ksheet/${FILE_TOKEN}/sheets`, {
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
  })
  return res.json()
}

/**
 * 获取单元格数据
 * @param sheetId - sheet 的 id 或 index
 * @param range - 范围，如 { row_from: 0, row_to: 100, col_from: 0, col_to: 10 }
 */
export async function getCells(sheetId: string, range?: {
  row_from: number
  row_to: number
  col_from: number
  col_to: number
}) {
  let url = `${KDOCS_API_BASE}/ksheet/${FILE_TOKEN}/sheets/${sheetId}/cells`
  
  if (range) {
    const params = new URLSearchParams()
    params.set('row_from', String(range.row_from))
    params.set('row_to', String(range.row_to))
    params.set('col_from', String(range.col_from))
    params.set('col_to', String(range.col_to))
    url += `?${params.toString()}`
  }

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
  })
  return res.json()
}

/**
 * 更新单元格数据
 * @param sheetId - sheet 的 id 或 index
 * @param cells - 单元格数据，格式：[{ row: 0, col: 0, value: 'xxx' }]
 */
export async function updateCells(sheetId: string, cells: Array<{ row: number; col: number; value: string }>) {
  const url = `${KDOCS_API_BASE}/ksheet/${FILE_TOKEN}/sheets/${sheetId}/cells`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cells }),
  })
  return res.json()
}

/**
 * 获取文档 Schema（数据表结构）
 */
export async function getSchema() {
  const res = await fetch(`${KDOCS_API_BASE}/ksheet/${FILE_TOKEN}/schemas`, {
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
  })
  return res.json()
}
