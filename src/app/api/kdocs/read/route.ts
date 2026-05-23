import { NextRequest, NextResponse } from 'next/server'
import { getSheets, getCells, getSchema } from '@/lib/kdocs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // 'sheets' | 'cells' | 'schema'
    const sheetId = searchParams.get('sheetId')
    const rowFrom = searchParams.get('rowFrom')
    const rowTo = searchParams.get('rowTo')
    const colFrom = searchParams.get('colFrom')
    const colTo = searchParams.get('colTo')

    if (action === 'sheets') {
      const data = await getSheets()
      return NextResponse.json(data)
    }

    if (action === 'schema') {
      const data = await getSchema()
      return NextResponse.json(data)
    }

    if (action === 'cells') {
      if (!sheetId) {
        return NextResponse.json({ error: 'sheetId is required' }, { status: 400 })
      }

      const range = rowFrom && rowTo && colFrom && colTo
        ? {
            row_from: parseInt(rowFrom),
            row_to: parseInt(rowTo),
            col_from: parseInt(colFrom),
            col_to: parseInt(colTo),
          }
        : undefined

      const data = await getCells(sheetId, range)
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Kdocs API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
