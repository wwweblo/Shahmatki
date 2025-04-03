import { NextResponse } from 'next/server'
import { getPositionById, getRandomPosition, getAllPositions, findPositionByFen } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const random = searchParams.get('random')
  const fen = searchParams.get('fen')

  try {
    if (fen) {
      const position = findPositionByFen(fen)
      if (!position) {
        return NextResponse.json({ error: 'Position not found' }, { status: 404 })
      }
      return NextResponse.json(position)
    }

    if (id) {
      const position = getPositionById(Number(id))
      if (!position) {
        return NextResponse.json({ error: 'Position not found' }, { status: 404 })
      }
      return NextResponse.json(position)
    }

    if (random) {
      const position = getRandomPosition()
      if (!position) {
        return NextResponse.json({ error: 'No positions found' }, { status: 404 })
      }
      return NextResponse.json(position)
    }

    const positions = getAllPositions()
    return NextResponse.json(positions)
  } catch (error) {
    console.error('Error fetching positions:', error)
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }, { status: 500 })
    }
    return NextResponse.json({ 
      error: 'Internal server error',
      details: 'Unknown error occurred'
    }, { status: 500 })
  }
} 