'use client'

import { useEffect, useState, useCallback } from 'react'
import { Chess } from 'chess.js'

const STOCKFISH_PATH = '/stockfish/stockfish.js'

interface EvaluationEntry {
  move: number
  evaluation: number
}

export function useStockfish(game: Chess, showAnalysis: boolean) {
  const [stockfish, setStockfish] = useState<Worker | null>(null)
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationEntry[]>([])
  const [depth, setDepth] = useState(0)
  const [bestMove, setBestMove] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const engine = new Worker(STOCKFISH_PATH)
    engine.postMessage('uci')
    setStockfish(engine)
    return () => engine.terminate()
  }, [])

  const analyzePosition = useCallback(() => {
    if (!stockfish || !showAnalysis) return
    setIsAnalyzing(true)
    stockfish.postMessage(`position fen ${game.fen()}`)
    stockfish.postMessage('go depth 18')

    stockfish.onmessage = (event) => {
      const response = event.data

      if (response.includes('bestmove')) {
        setBestMove(response.split('bestmove ')[1].split(' ')[0])
        setIsAnalyzing(false)
      } else if (response.includes('score cp')) {
        const match = response.match(/score cp (-?\d+)/)
        if (match) {
          const evalCp = parseInt(match[1], 10) / 100

          // Определяем номер хода по истории
          const moveNumber = game.history().length

          setEvaluationHistory(prev => [...prev, { move: moveNumber, evaluation: evalCp }])
        }
      } else if (response.includes('depth')) {
        const match = response.match(/depth (\\d+)/)
        if (match) setDepth(parseInt(match[1], 10))
      }
    }
  }, [game, stockfish, showAnalysis])

  useEffect(() => {
    if (showAnalysis) {
      analyzePosition()
    } else {
      setBestMove(null)
      setEvaluationHistory([])
      setDepth(0)
    }
  }, [game.fen(), showAnalysis, analyzePosition])

  return { evaluationHistory, depth, bestMove, isAnalyzing }
}
