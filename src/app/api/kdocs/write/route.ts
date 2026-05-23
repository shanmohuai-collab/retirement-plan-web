import { NextRequest, NextResponse } from 'next/server'
import { updateCells } from '@/lib/kdocs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sheetId, cells } = body

    if (!sheetId || !cells) {
      return NextResponse.json(
        { error: 'sheetId and cells are required' },
        { status: 400 }
      )
    }

    const data = await updateCells(sheetId, cells)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Kdocs write API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
