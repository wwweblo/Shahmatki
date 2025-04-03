'use client'

import React from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Position {
  id: number
  name_en: string
  name_ru: string
  fen: string
}

const AnalisisPage = () => {
  const [game, setGame] = useState<Chess>(new Chess())
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkPosition(game.fen())
  }, [])

  const onPieceDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const gameCopy = new Chess(game.fen())
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      })

      if (move === null) return false
      setGame(gameCopy)
      checkPosition(gameCopy.fen())
      return true
    } catch {
      return false
    }
  }

  const checkPosition = async (fen: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/positions?fen=${encodeURIComponent(fen)}`)
      if (response.ok) {
        const position = await response.json()
        setCurrentPosition(position)
      } else {
        setCurrentPosition(null)
      }
    } catch (error) {
      console.error('Error checking position:', error)
      setCurrentPosition(null)
    } finally {
      setLoading(false)
    }
  }

  const resetBoard = () => {
    setGame(new Chess())
    checkPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Анализ позиции</h1>
        <Button onClick={resetBoard}>
          Сбросить доску
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(500px,_1fr)_400px] gap-6">
        <div className="flex justify-center">
          <Chessboard 
            position={game.fen()}
            onPieceDrop={onPieceDrop}
            boardWidth={500}
          />
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Информация о позиции</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground">Поиск позиции...</div>
            ) : currentPosition ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Название на русском:</h3>
                  <p className="text-lg">{currentPosition.name_ru}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Название на английском:</h3>
                  <p className="text-lg">{currentPosition.name_en}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">FEN:</h3>
                  <p className="text-sm font-mono bg-muted p-2 rounded break-all">{currentPosition.fen}</p>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                Позиция не найдена в базе данных. Попробуйте изменить расположение фигур.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalisisPage