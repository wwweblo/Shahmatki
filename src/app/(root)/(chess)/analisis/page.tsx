'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess, Square } from 'chess.js'
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
  const [showAnalysis, setShowAnalysis] = useState(true)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
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
  // Add new state near other state declarations
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Update analyzePosition function
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
      setMoveHistory(prev => [...prev, move.san])
      setCurrentMoveIndex(prev => prev + 1)
      checkPosition(gameCopy.fen())
      return true
    } catch {
      return false
    }
  }

  const undoMove = () => {
    if (currentMoveIndex < 0) return
    
    const gameCopy = new Chess()
    for (let i = 0; i < currentMoveIndex; i++) {
      gameCopy.move(moveHistory[i])
    }
    setGame(gameCopy)
    setCurrentMoveIndex(prev => prev - 1)
    checkPosition(gameCopy.fen())
  }

  const redoMove = () => {
    if (currentMoveIndex >= moveHistory.length - 1) return
    
    const gameCopy = new Chess()
    for (let i = 0; i <= currentMoveIndex + 1; i++) {
      gameCopy.move(moveHistory[i])
    }
    setGame(gameCopy)
    setCurrentMoveIndex(prev => prev + 1)
    checkPosition(gameCopy.fen())
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
    setMoveHistory([])
    setCurrentMoveIndex(-1)
    checkPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  }

  const handleFenInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      game.load(e.target.value)
      checkPosition(game.fen())
    } catch (error) {
      console.error('Error loading FEN:', error)
    }
  }

  // Add new state for board width
  const [boardWidth, setBoardWidth] = useState(500)

  // Updated window resize handler
  useEffect(() => {
    const updateBoardWidth = () => {
      const width = window.innerWidth
      if (width < 768) { // Mobile breakpoint
        setBoardWidth(Math.min(width * 0.90, 500)) // 95% of screen width, max 500px
      } else {
        setBoardWidth(500) // Desktop size
      }
    }

    // Initial call
    updateBoardWidth()

    // Add event listener
    window.addEventListener('resize', updateBoardWidth)

    // Cleanup
    return () => window.removeEventListener('resize', updateBoardWidth)
  }, [])

  // Update the header section in the return statement
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Анализ позиции</h1>
          {isAnalyzing && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          )}
        </div>
      </div>

      {/* Update grid to be more responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full xl:w-fit mx-auto">
        <div className="flex flex-col gap-4 w-full xl:w-fit">
          <div className="flex justify-center items-center w-full">
            <Chessboard 
              position={game.fen()}
              onPieceDrop={onPieceDrop}
              boardWidth={boardWidth}
              customArrows={bestMove ? [[
                bestMove.substring(0, 2) as Square,
                bestMove.substring(2, 4) as Square,
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

          <div className="flex flex-col gap-2">
            <Label>PGN партии:</Label>
            <div className="p-2 bg-muted rounded font-mono text-sm">
              {moveHistory.length > 0 ? moveHistory.join(' ') : 'Нет ходов'}
            </div>
          </div>

        </div>

        {/* Анализ позиции */}
        <aside className="flex flex-col gap-4">
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
          {/* Название позиции */}
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
                    <a 
                      href={`https://ya.ru/search/?text=%D1%88%D0%B0%D1%85%D0%BC%D0%B0%D1%82%D0%BD%D1%8B%D0%B9+%D0%B4%D0%B5%D0%B1%D1%8E%D1%82+${encodeURIComponent(currentPosition.name_ru)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-normal hover:underline text-primary"
                    >
                      {currentPosition.name_ru}
                    </a>
                    <a 
                      href={`https://www.google.com/search?q=chess+opening+${encodeURIComponent(currentPosition.name_en)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm font-medium text-muted-foreground hover:underline"
                    >
                      {currentPosition.name_en}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  Позиция не найдена в базе данных. Попробуйте изменить расположение фигур.
                </div>
              )}
            </CardContent>
          </Card>
          {/* Оценка позиции */}
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
          {/* Возврат хода */}
          <div className="flex gap-2">
            <Button 
              onClick={undoMove} 
              disabled={currentMoveIndex < 0}
              variant="outline"
            >
              Отменить ход
            </Button>
            <Button 
              onClick={redoMove} 
              disabled={currentMoveIndex >= moveHistory.length - 1}
              variant="outline"
            >
              Вернуть ход
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default AnalisisPage