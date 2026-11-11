import { create_an_empty_connect4_game_state, get_legal_moves, check_status, score_game_state, minimax } from './game'
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

describe('score_game_state', () => {
  test('scores an empty board and a draw as neutral', () => {
    expect(score_game_state(create_an_empty_connect4_game_state(4, 4), 4)).toBe(0)

    expect(score_game_state({
      matrix: [
        [R, Y, R, Y],
        [R, Y, R, Y],
        [Y, R, Y, R],
        [Y, R, Y, R],
      ],
      current_player: WhichPlayer.P1,
    }, 4)).toBe(0)
  })

  test('scores terminal wins as positive or negative infinity', () => {
    expect(score_game_state({
      matrix: [[R, R, R, R], [N, N, N, N]],
      current_player: WhichPlayer.P2,
    }, 4)).toBe(Infinity)

    expect(score_game_state({
      matrix: [[Y, Y, Y, Y], [N, N, N, N]],
      current_player: WhichPlayer.P1,
    }, 4)).toBe(-Infinity)
  })

  test('scores equivalent P1 and P2 positions symmetrically', () => {
    const redState = {
      matrix: [[N, N, N, R], [N, N, N, R], [N, N, N, N], [N, N, N, N]],
      current_player: WhichPlayer.P1,
    }
    const yellowState = {
      matrix: [[N, N, N, Y], [N, N, N, Y], [N, N, N, N], [N, N, N, N]],
      current_player: WhichPlayer.P2,
    }

    expect(score_game_state(redState, 4)).toBe(-score_game_state(yellowState, 4))
  })

  test('weights stronger open windows exponentially', () => {
    const onePiece = {
      matrix: [[N, N, N, R], [N, N, N, N], [N, N, N, N], [N, N, N, N]],
      current_player: WhichPlayer.P1,
    }
    const threePieces = {
      matrix: [[N, N, N, R], [N, N, N, R], [N, N, N, R], [N, N, N, N]],
      current_player: WhichPlayer.P2,
    }

    expect(score_game_state(threePieces, 4)).toBeGreaterThan(score_game_state(onePiece, 4))
  })

  test('counts gapped threats and ignores mixed windows', () => {
    const gapped = {
      matrix: [[N, N, N, R], [N, N, N, N], [N, N, N, R], [N, N, N, R]],
      current_player: WhichPlayer.P2,
    }
    const mixed = {
      matrix: [[R], [N], [R], [Y]],
      current_player: WhichPlayer.P1,
    }

    expect(score_game_state(gapped, 4)).toBeGreaterThan(0)
    expect(score_game_state(mixed, 4)).toBe(0)
  })

  test.each([
    {
      name: 'horizontal',
      matrix: [[N, N, N, R], [N, N, N, R], [N, N, N, R], [N, N, N, N]],
    },
    {
      name: 'vertical',
      matrix: [[N, R, R, R], [N, N, N, N], [N, N, N, N], [N, N, N, N]],
    },
    {
      name: 'descending diagonal',
      matrix: [[R, Y, Y, R], [N, R, Y, R], [N, N, R, Y], [N, N, N, N]],
    },
    {
      name: 'ascending diagonal',
      matrix: [[N, N, N, R], [N, N, R, Y], [N, R, Y, Y], [N, N, N, N]],
    },
  ])('scores an open $name window', ({ matrix }) => {
    expect(score_game_state({ matrix, current_player: WhichPlayer.P2 }, 4)).toBeGreaterThan(0)
  })

  test('does not mutate the game state', () => {
    const state = {
      matrix: [[N, N, R], [N, N, N], [N, N, N]],
      current_player: WhichPlayer.P2,
    }
    const before = structuredClone(state)

    score_game_state(state, 3)

    expect(state).toEqual(before)
  })
})

describe('minimax', () => {
  test('finds an immediate winning move for P1', () => {
    expect(minimax({
      matrix: [
        [N, N, N, R],
        [N, N, N, R],
        [N, N, N, R],
        [N, N, N, N],
      ],
      current_player: WhichPlayer.P1,
    }, 4, 2)).toBe(3)
  })

  test('finds an immediate winning move for P2', () => {
    expect(minimax({
      matrix: [
        [N, N, N, N],
        [N, Y, Y, Y],
        [N, N, N, N],
        [N, N, N, N],
      ],
      current_player: WhichPlayer.P2,
    }, 4, 2)).toBe(1)
  })

  test('blocks the opponent winning on their next turn', () => {
    expect(minimax({
      matrix: [
        [N, N, N, R],
        [N, N, N, R],
        [N, N, N, R],
        [N, N, N, N],
        [N, N, N, Y],
      ],
      current_player: WhichPlayer.P2,
    }, 4, 2)).toBe(3)
  })

  test('returns null when the game is already over', () => {
    expect(minimax({
      matrix: [[R, R, R, R], [N, N, N, N]],
      current_player: WhichPlayer.P2,
    })).toBeNull()
  })

  test('still returns a legal move when every move eventually loses', () => {
    const state = {
      matrix: [
        [N, Y, Y, Y],
        [N, Y, Y, Y],
        [N, N, N, R],
        [N, N, N, R],
      ],
      current_player: WhichPlayer.P1,
    }
    const move = minimax(state, 4, 2)

    expect(move).not.toBeNull()
    expect(get_legal_moves(state)).toContain(move)
  })

  test('prefers a center column when moves have equal scores', () => {
    expect(minimax(create_an_empty_connect4_game_state(4, 5), 6, 1)).toBe(2)
  })

  test('rejects invalid search depth', () => {
    expect(() => minimax(create_an_empty_connect4_game_state(4, 4), 4, 0))
      .toThrow('maxDepth must be a positive integer')
  })

  test('does not mutate the game state', () => {
    const state = create_an_empty_connect4_game_state(4, 4)
    const before = structuredClone(state)

    minimax(state, 4, 2)

    expect(state).toEqual(before)
  })
})
