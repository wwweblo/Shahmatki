'use client'

import { useEffect, useState } from 'react'

export function useResponsiveBoard() {
  const [boardWidth, setBoardWidth] = useState(500)

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth
      setBoardWidth(width < 768 ? Math.min(width * 0.90, 500) : 500)
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  return boardWidth
}
