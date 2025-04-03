'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface Position {
  id: number
  name_en: string
  name_ru: string
  fen: string
}

const STOCKFISH_PATH = '/stockfish/stockfish.js'

const AnalisisPage = () => {
  const [game, setGame] = useState<Chess>(new Chess())
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null)
  const [loading, setLoading] = useState(true)
  const [stockfish, setStockfish] = useState<Worker | null>(null)
  const [evaluation, setEvaluation] = useState(0)
  const [depth, setDepth] = useState(0)
  const [bestMove, setBestMove] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  // Инициализация Stockfish
  useEffect(() => {
    const engine = new Worker(STOCKFISH_PATH)
    engine.postMessage('uci')
    setStockfish(engine)

    return () => {
      engine.terminate()
    }
  }, [])

  // Анализ позиции
  const analyzePosition = useCallback(() => {
    if (!stockfish || !showAnalysis) return

    setIsAnalyzing(true)
    stockfish.postMessage(`position fen ${game.fen()}`)
    stockfish.postMessage('go depth 18')

    stockfish.onmessage = (event) => {
      const response = event.data
      
      if (response.includes('bestmove')) {
        const move = response.split('bestmove ')[1].split(' ')[0]
        setBestMove(move)
        setIsAnalyzing(false)
      } else if (response.includes('score cp')) {
        const match = response.match(/score cp (-?\d+)/)
        if (match) {
          const evalValue = parseInt(match[1], 10) / 100
          setEvaluation(evalValue)
        }
      } else if (response.includes('depth')) {
        const match = response.match(/depth (\d+)/)
        if (match) {
          setDepth(parseInt(match[1], 10))
        }
      }
    }
  }, [game, stockfish, showAnalysis])

  useEffect(() => {
    if (showAnalysis) {
      analyzePosition()
    } else {
      setBestMove(null)
      setEvaluation(0)
      setDepth(0)
    }
  }, [game.fen(), showAnalysis, analyzePosition])

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

  const handleFenInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { valid } = game.validate_fen(e.target.value)
    if (valid) {
      game.load(e.target.value)
      checkPosition(game.fen())
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Анализ позиции</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="analysis-mode"
              checked={showAnalysis}
              onCheckedChange={setShowAnalysis}
            />
            <Label htmlFor="analysis-mode">Анализ позиции</Label>
          </div>
          <Button onClick={resetBoard}>
            Сбросить доску
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(500px,_1fr)_400px] gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <Chessboard 
              position={game.fen()}
              onPieceDrop={onPieceDrop}
              boardWidth={500}
              customArrows={bestMove ? [[
                bestMove.substring(0, 2) as any,
                bestMove.substring(2, 4) as any,
                'rgb(0, 128, 0)'
              ]] : undefined}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="fen-input">FEN позиции:</Label>
            <Input
              id="fen-input"
              ref={inputRef}
              value={game.fen()}
              onChange={handleFenInput}
              className="font-mono"
            />
          </div>

          {showAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Анализ позиции</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Оценка позиции:</span>{' '}
                    {evaluation > 0 ? '+' : ''}{evaluation.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">Глубина анализа:</span> {depth}
                  </div>
                  {bestMove && (
                    <div>
                      <span className="font-medium">Лучший ход:</span>{' '}
                      {bestMove}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
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