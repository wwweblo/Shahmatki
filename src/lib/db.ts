import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'src', 'data', 'chess_openings.db')
const db = new Database(dbPath, { readonly: true })

export interface Position {
  id: number
  name_en: string
  name_ru: string
  fen: string
}

export function getPositionById(id: number): Position | null {
  const stmt = db.prepare('SELECT * FROM Openings WHERE id = ?')
  return stmt.get(id) as Position | null
}

export function getAllPositions(): Position[] {
  const stmt = db.prepare('SELECT * FROM Openings')
  return stmt.all() as Position[]
}

export function getRandomPosition(): Position | null {
  const stmt = db.prepare('SELECT * FROM Openings ORDER BY RANDOM() LIMIT 1')
  return stmt.get() as Position | null
}

export function findPositionByFen(fen: string): Position | null {
  const stmt = db.prepare('SELECT * FROM Openings WHERE fen = ?')
  return stmt.get(fen) as Position | null
} 