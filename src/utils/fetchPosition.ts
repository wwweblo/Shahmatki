export async function fetchPosition(fen: string) {
    try {
      const response = await fetch(`/api/positions?fen=${encodeURIComponent(fen)}`)
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error('Error fetching position:', error)
      return null
    }
  }
  