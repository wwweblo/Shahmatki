'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface ControlsProps {
  onReset: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  showAnalysis: boolean
  toggleAnalysis: (value: boolean) => void
}

export function Controls({ onReset, onUndo, onRedo, canUndo, canRedo, showAnalysis, toggleAnalysis }: ControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch id="analysis-mode" checked={showAnalysis} onCheckedChange={toggleAnalysis} />
          <Label htmlFor="analysis-mode">Анализ позиции</Label>
        </div>
        <Button onClick={onReset}>Сбросить доску</Button>
      </div>
      <div className="flex gap-2">
        <Button onClick={onUndo} disabled={!canUndo} variant="outline">Отменить ход</Button>
        <Button onClick={onRedo} disabled={!canRedo} variant="outline">Вернуть ход</Button>
      </div>
    </div>
  )
}
