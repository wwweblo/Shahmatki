'use client'

import { Chessboard } from 'react-chessboard'
import { Square } from 'chess.js'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRef } from 'react'

interface ChessboardSectionProps {
  fen: string
  onPieceDrop: (from: string, to: string) => boolean
  boardWidth: number
  bestMove?: string | null
  onFenChange: (fen: string) => void
}

export function ChessboardSection({ fen, onPieceDrop, boardWidth, bestMove, onFenChange }: ChessboardSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-4 w-full xl:w-fit">
      <Chessboard
        position={fen}
        onPieceDrop={onPieceDrop}
        boardWidth={boardWidth}
        customArrows={bestMove ? [[
          bestMove.substring(0, 2) as Square,
          bestMove.substring(2, 4) as Square,
          'rgb(0, 128, 0)'
        ]] : undefined}
      />
      <div className="flex flex-col gap-2">
        <Label htmlFor="fen-input">FEN позиции:</Label>
        <Input
          id="fen-input"
          ref={inputRef}
          value={fen}
          onChange={(e) => onFenChange(e.target.value)}
          className="font-mono"
        />
      </div>
    </div>
  )
}
