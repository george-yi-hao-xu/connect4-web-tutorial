import { create_an_empty_connect4_game_state, get_legal_moves, check_status } from './game'
import { GamePlace, WhichPlayer } from '../types'
import { describe, test, expect } from '@jest/globals'

const N = GamePlace.NONE
const R = GamePlace.RED
const Y = GamePlace.YELLOW

describe('create_an_empty_connect4_game_state', () => {
  test('creates a 3-row, 4-column empty board with P1 to move', () => {
    const N = GamePlace.NONE

    expect(create_an_empty_connect4_game_state(3, 4)).toEqual({
      matrix: [
        [N, N, N],
        [N, N, N],
        [N, N, N],
        [N, N, N],
      ],
      current_player: WhichPlayer.P1,
    })
  })
})

describe('get_legal_moves', () => {
  test('returns every column on an empty board', () => {
    expect(get_legal_moves({
      matrix: [
        [N, N, N],
        [N, N, N],
        [N, N, N],
        [N, N, N],
      ],
      current_player: WhichPlayer.P1,
    })).toEqual([0, 1, 2, 3])
  })

  test('skips full columns and returns legal column indices in order', () => {
    expect(get_legal_moves({
      matrix: [
        [R, Y, R],
        [N, Y, R],
        [Y, R, Y],
        [N, N, Y],
      ],
      current_player: WhichPlayer.P1,
    })).toEqual([1, 3])
  })

  test('returns no moves when all columns are full', () => {
    expect(get_legal_moves({
      matrix: [
        [R, Y, R],
        [Y, R, Y],
      ],
      current_player: WhichPlayer.P1,
    })).toEqual([])
  })
})

describe('check_status', () => {
  // matrix[col][row]，每个子数组是一列，顶格在索引 0。
  test('returns OnGoing with the current player when moves remain', () => {
    expect(check_status({
      matrix: [[N, N, N, R], [N, N, N, N]],
      current_player: WhichPlayer.P2,
    }, 4)).toEqual({
      tag: 'OnGoing',
      player: WhichPlayer.P2,
    })
  })

  test('returns a P1 win even when moves remain', () => {
    expect(check_status({
      matrix: [[R, R, R, R], [N, Y, Y, Y]],
      current_player: WhichPlayer.P2,
    }, 4)).toEqual({
      tag: 'Win',
      player: WhichPlayer.P1,
      winning_cells: [
        { col: 0, row: 0 },
        { col: 0, row: 1 },
        { col: 0, row: 2 },
        { col: 0, row: 3 },
      ],
    })
  })

  test('returns a P2 win on a full board', () => {
    expect(check_status({
      matrix: [[Y, Y, Y, Y], [R, R, R, Y]],
      current_player: WhichPlayer.P1,
    }, 4)).toEqual({
      tag: 'Win',
      player: WhichPlayer.P2,
      winning_cells: [
        { col: 0, row: 0 },
        { col: 0, row: 1 },
        { col: 0, row: 2 },
        { col: 0, row: 3 },
      ],
    })
  })

  test('returns Draw when the board is full and neither player wins', () => {
    expect(check_status({
      matrix: [
        [R, Y, R, Y],
        [R, Y, R, Y],
        [Y, R, Y, R],
        [Y, R, Y, R],
      ],
      current_player: WhichPlayer.P1,
    }, 4)).toEqual({
      tag: 'Draw',
    })
  })

  test('returns P1 Win', () => {
    expect(check_status({
      matrix: [
        [R, Y, R, Y],
        [R, R, R, Y],
        [Y, R, R, R],
        [Y, R, Y, R],
      ],
      current_player: WhichPlayer.P1,
    }, 4)).toEqual({
      tag: 'Win',
      player: WhichPlayer.P1,
      winning_cells: [
        { col: 0, row: 0 },
        { col: 1, row: 1 },
        { col: 2, row: 2 },
        { col: 3, row: 3 },
      ],
    })
  })

  test('throws when both players have a winning line', () => {
    expect(() => check_status({
      matrix: [[R, R, R, R], [Y, Y, Y, Y]],
      current_player: WhichPlayer.P1,
    }, 4)).toThrow('Both players win')
  })
})
