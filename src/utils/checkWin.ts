import { CellCoord, GamePlace } from "../types";

export function find_winning_cells(
  matrix: GamePlace[][],
  target: GamePlace,
  chain: number,
): CellCoord[] | null {
  if (chain <= 1) throw new Error('Chain must be bigger than 1')

  const directions = [
    { dc: 1, dr: 0 },  // →
    { dc: 0, dr: 1 },  // ↓
    { dc: 1, dr: 1 },  // ↘
    { dc: -1, dr: 1 }, // ↙
  ]

  for (const [col, column] of matrix.entries()) {
    for (const [row, place] of column.entries()) {
      if (place !== target) continue

      for (const { dc, dr } of directions) {
        const cells: CellCoord[] = [{ col, row }]

        for (let step = 1; step < chain; step++) {
          const nextCol = col + step * dc
          const nextRow = row + step * dr

          if (matrix[nextCol]?.[nextRow] !== target) break

          cells.push({ col: nextCol, row: nextRow })
        }

        if (cells.length === chain) return cells
      }
    }
  }

  return null
}
