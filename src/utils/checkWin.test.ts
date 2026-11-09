import { describe, expect, test } from '@jest/globals';
import { transpose, is_all_list_elements_same, r_check_win_in_a_list, get_diagonals, check_win } from './checkWin';
import { GamePlace } from '../types';

const R = GamePlace.RED;
const Y = GamePlace.YELLOW;
const N = GamePlace.NONE;

describe('transpose fn', () => {
    test('empty', () => {
        expect(() => transpose([[]])).toThrow('A matrix cannot be 0 dimensional')
    })

    test('not uni', () => {
        expect(() => transpose([[R], [R, R]])).toThrow('This matrix is not uni')
    })

    test('simple one-dimensional matrix', () => {
        expect(transpose([[R]])).toEqual([[R]])
    })

    test('two-dimensional matrix', () => {
        expect(transpose([
            [R, Y], [N, R]
        ])).toEqual([
            [R, N], [Y, R]
        ])
    })

    test('2*3 matrix', () => {
        expect(transpose([
            [R, Y, N], [N, Y, Y]
        ])).toEqual([
            [R, N], [Y, Y], [N, Y]
        ])
    })
})

describe('get_diagonals', () => {
  test('returns both diagonal directions in order', () => {
    const matrix = [
      [1, 5, 9],
      [2, 6, 10],
      [3, 7, 11],
      [4, 8, 12],
    ]

    expect(get_diagonals(matrix)).toEqual([
      // ↘
      [1, 6, 11],
      [5, 10],
      [9],
      [2, 7, 12],
      [3, 8],
      [4],
      // ↙
      [1],
      [5, 2],
      [9, 6, 3],
      [10, 7 ,4],
      [11, 8],
      [12],
    ])
  })

  test('returns no diagonals for an empty matrix', () => {
    expect(get_diagonals([])).toEqual([])
  })
})

describe('is_all_list_elements_same', () => {
    test('empty', () => {
        expect(is_all_list_elements_same([])).toBe(false)
    })

    test('one item', () => {
        expect(is_all_list_elements_same([R])).toBe(true)
    })

    test('multi items', () => {
        expect(is_all_list_elements_same([R, N, Y])).toBe(false)
        expect(is_all_list_elements_same([R, R, R])).toBe(true)
    })
})

describe('r_check_win_in_a_list', () => {
    test('win 3 or not', () => {
        expect(r_check_win_in_a_list([R, R, R, N], R, 3)).toBe(true);
        expect(r_check_win_in_a_list([N, R, R, R, N], R, 3)).toBe(true);
        expect(r_check_win_in_a_list([R, N, R, N], R, 3)).toBe(false);
    })
})

describe('check_win', () => {
  // matrix[col][row]，每个子数组是一列。
  const winningBoards = [
    {
      name: 'vertical',
      matrix: [
        [N, N, N, N],
        [R, R, R, R],
        [N, N, N, N],
        [N, N, N, N],
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
    },
    {
      name: 'down-right diagonal',
      matrix: [
        [R, N, N, N],
        [N, R, N, N],
        [N, N, R, N],
        [N, N, N, R],
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
    },
  ]

  test.each(winningBoards)('detects a $name win', ({ matrix }) => {
    expect(check_win(matrix, R, 4)).toBe(true)
    expect(check_win(matrix, Y, 4)).toBe(false)
  })

  test('requires four consecutive pieces', () => {
    const matrix = [[R], [R], [N], [R], [R]]

    expect(check_win(matrix, R, 4)).toBe(false)
  })

  test('uses the requested chain length', () => {
    const matrix = [[Y, R, R, R]]

    expect(check_win(matrix, R, 3)).toBe(true)
    expect(check_win(matrix, R, 4)).toBe(false)
  })
})
