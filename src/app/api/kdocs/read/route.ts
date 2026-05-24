import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

// 读取本地 JSON 数据文件
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sheet = searchParams.get('sheet') // 'weight' | 'writing' | 'investment'
    
    if (!sheet) {
      return NextResponse.json({ error: 'sheet parameter is required' }, { status: 400 })
    }
    
    // 只允向访问已知的数据文件
    const allowedSheets = ['weight', 'writing', 'investment']
    if (!allowedSheets.includes(sheet)) {
      return NextResponse.json({ error: 'Invalid sheet name' }, { status: 400 })
    }
    
    const filePath = join(process.cwd(), 'public', 'data', `${sheet}.json`)
    
    try {
      const fileContent = readFileSync(filePath, 'utf-8')
      const data = JSON.parse(fileContent)
      return NextResponse.json(data)
    } catch (readError: any) {
      // 文件不存在，返回空数据结构
      if (readError.code === 'ENOENT') {
        const emptyData: any = {
          weight: { headers: [], rows: [], summary: {} },
          writing: { headers: [], rows: [], summary: {} },
          investment: { headers: [], rows: [], summary: {} },
        }
        return NextResponse.json(emptyData[sheet] || { headers: [], rows: [] })
      }
      throw readError
    }
  } catch (error: any) {
    console.error('Read API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// 保存编辑到 JSON 文件（写入文件系统，Vercel 上会写入 /tmp/）
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { tmpdir } from 'os'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sheet, rows, headers, summary } = body
    
    if (!sheet) {
      return NextResponse.json({ error: 'sheet parameter is required' }, { status: 400 })
    }
    
    const allowedSheets = ['weight', 'writing', 'investment']
    if (!allowedSheets.includes(sheet)) {
      return NextResponse.json({ error: 'Invalid sheet name' }, { status: 400 })
    }
    
    const data = { sheetName: sheet, headers, rows, summary }
    
    // 在 Vercel 上，写入 /tmp/ 目录（临时，函数重启后丢失）
    // 本地开发写入 public/data/ 目录
    const isVercel = process.env.VERCEL === '1'
    let filePath: string
    
    if (isVercel) {
      const tmpDir = join(tmpdir(), 'retirement-plan-data')
      if (!existsSync(tmpDir)) {
        mkdirSync(tmpDir, { recursive: true })
      }
      filePath = join(tmpDir, `${sheet}.json`)
    } else {
      filePath = join(process.cwd(), 'public', 'data', `${sheet}.json`)
    }
    
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true, message: '保存成功' })
  } catch (error: any) {
    console.error('Write API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
