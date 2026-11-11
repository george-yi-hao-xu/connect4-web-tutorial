import { describe, expect, test } from '@jest/globals'
import { find_winning_cells } from './checkWin'
import { GamePlace } from '../types'

const R = GamePlace.RED
const Y = GamePlace.YELLOW
const N = GamePlace.NONE

describe('find_winning_cells', () => {
  const winningBoards = [
    {
      name: 'vertical',
      matrix: [
        [N, N, N, N],
        [R, R, R, R],
        [N, N, N, N],
        [N, N, N, N],
      ],
      cells: [
        { col: 1, row: 0 },
        { col: 1, row: 1 },
        { col: 1, row: 2 },
        { col: 1, row: 3 },
      ],
    },
    {
      name: 'horizontal',
      matrix: [
        [N, R, N, N],
        [N, R, N, N],
        [N, R, N, N],
        [N, R, N, N],
      ],
      cells: [
        { col: 0, row: 1 },
        { col: 1, row: 1 },
        { col: 2, row: 1 },
        { col: 3, row: 1 },
      ],
    },
    {
      name: 'down-right diagonal',
      matrix: [
        [R, N, N, N],
        [N, R, N, N],
        [N, N, R, N],
        [N, N, N, R],
      ],
      cells: [
        { col: 0, row: 0 },
        { col: 1, row: 1 },
        { col: 2, row: 2 },
        { col: 3, row: 3 },
      ],
    },
    {
      name: 'down-left diagonal',
      matrix: [
        [N, N, N, R],
        [N, N, R, N],
        [N, R, N, N],
        [R, N, N, N],
      ],
      cells: [
        { col: 3, row: 0 },
        { col: 2, row: 1 },
        { col: 1, row: 2 },
        { col: 0, row: 3 },
      ],
    },
  ]

  test.each(winningBoards)('returns cells for a $name win', ({ matrix, cells }) => {
    expect(find_winning_cells(matrix, R, 4)).toEqual(cells)
    expect(find_winning_cells(matrix, Y, 4)).toBeNull()
  })

  test('returns null when consecutive pieces are interrupted', () => {
    expect(find_winning_cells([[R], [R], [N], [R], [R]], R, 4)).toBeNull()
  })

  test('uses the requested chain length', () => {
    const matrix = [[Y, R, R, R]]

    expect(find_winning_cells(matrix, R, 3)).toEqual([
      { col: 0, row: 1 },
      { col: 0, row: 2 },
      { col: 0, row: 3 },
    ])
    expect(find_winning_cells(matrix, R, 4)).toBeNull()
  })

  test('rejects a chain length smaller than two', () => {
    expect(() => find_winning_cells([[R]], R, 1)).toThrow('Chain must be bigger than 1')
  })
})
