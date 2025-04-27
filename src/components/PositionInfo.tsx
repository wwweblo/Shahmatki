'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PositionInfoProps {
  loading: boolean
  position: { name_en: string; name_ru: string } | null
}

export function PositionInfo({ loading, position }: PositionInfoProps) {
  return (
    <Card className="h-fit">
      <CardHeader><CardTitle>Информация о позиции</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground">Поиск позиции...</div>
        ) : position ? (
          <div className="space-y-2">
            <a href={`https://ya.ru/search/?text=%D1%88%D0%B0%D1%85%D0%BC%D0%B0%D1%82%D0%BD%D1%8B%D0%B9+%D0%B4%D0%B5%D0%B1%D1%8E%D1%82+${encodeURIComponent(position.name_ru)}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {position.name_ru}
            </a>
            <a href={`https://www.google.com/search?q=chess+opening+${encodeURIComponent(position.name_en)}`} target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:underline text-sm">
              {position.name_en}
            </a>
          </div>
        ) : (
          <div className="text-muted-foreground">Позиция не найдена. Попробуйте изменить расположение фигур.</div>
        )}
      </CardContent>
    </Card>
  )
}
