'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AnalysisPanelProps {
  evaluation: number
  depth: number
  bestMove?: string | null
}

export function AnalysisPanel({ evaluation, depth, bestMove }: AnalysisPanelProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Анализ позиции</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div><span className="font-medium">Оценка:</span> {evaluation > 0 ? '+' : ''}{evaluation.toFixed(2)}</div>
        <div><span className="font-medium">Глубина:</span> {depth}</div>
        {bestMove && <div><span className="font-medium">Лучший ход:</span> {bestMove}</div>}
      </CardContent>
    </Card>
  )
}
