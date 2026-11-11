import { GameMove, GamePlace, GameState, Status, WhichPlayer } from "../types";
import { find_winning_cells } from "./checkWin";

export function create_an_empty_connect4_game_state(row: number, col: number): GameState{
    const matrix: GamePlace[][] = Array(col).fill(Array(row).fill(GamePlace.NONE))
    const current_player = WhichPlayer.P1

    return {matrix, current_player}
}

export function get_legal_moves(s: GameState){
    const legalMoves: GameMove[] = []
    for (let curr_col = 0; curr_col < s.matrix.length; curr_col++) {
        if (s.matrix[curr_col][0] === GamePlace.NONE) {
            legalMoves.push(curr_col)
        }
    }
    return legalMoves;
}

export function check_status(s: GameState, chain: number): Status {
    const P1_winning_cells = find_winning_cells(s.matrix, GamePlace.RED, chain);
    const P2_winning_cells = find_winning_cells(s.matrix, GamePlace.YELLOW, chain);
    const legal_next_moves = get_legal_moves(s)

    if (P1_winning_cells && P2_winning_cells) {
        // should not happen
        console.warn("Both players win. ERROR");
        throw new Error("Both players win")
    }

    if (!P1_winning_cells && !P2_winning_cells && legal_next_moves.length === 0){
        // draw
        return {
            tag: 'Draw'
        }
    }

    if (P1_winning_cells) {
        return {
            tag: 'Win',
            player: WhichPlayer.P1,
            winning_cells: P1_winning_cells,
        }
    }

    if (P2_winning_cells) {
        return {
            tag: 'Win',
            player: WhichPlayer.P2,
            winning_cells: P2_winning_cells,
        }
    }

    return {
        tag: 'OnGoing',
        player: s.current_player
    }
}

// codex gened
export function score_game_state(s: GameState, chain: number): number {
    const status = check_status(s, chain)

    if (status.tag === 'Win') {
        return status.player === WhichPlayer.P1 ? Infinity : -Infinity
    }

    if (status.tag === 'Draw') {
        return 0
    }

    const directions = [
        { dc: 1, dr: 0 },
        { dc: 0, dr: 1 },
        { dc: 1, dr: 1 },
        { dc: 1, dr: -1 },
    ]
    let score = 0

    for (const [col_i, column] of s.matrix.entries()) {
        for (const row_i of column.keys()) {
            for (const { dc, dr } of directions) {
                let red = 0
                let yellow = 0
                let completeWindow = true

                for (let step = 0; step < chain; step++) {
                    const place = s.matrix[col_i + step * dc]?.[row_i + step * dr]

                    // go outside the board
                    if (place === undefined) {
                        completeWindow = false
                        break
                    }

                    if (place === GamePlace.RED) red++
                    if (place === GamePlace.YELLOW) yellow++
                }

                // not possible to achieve a chain
                if (!completeWindow || (red > 0 && yellow > 0)) continue

                if (red > 0) score += 10 ** (red - 1)
                if (yellow > 0) score -= 10 ** (yellow - 1)
            }
        }
    }

    return score
}

// codex gened
export function minimax(
    s: GameState,
    chain: number = 4,
    maxDepth: number = 5,
): GameMove | null {
    if (!Number.isInteger(maxDepth) || maxDepth < 1) {
        throw new Error('maxDepth must be a positive integer')
    }

    if (check_status(s, chain).tag !== 'OnGoing') return null

    function ordered_legal_moves(state: GameState): GameMove[] {
        const center = (state.matrix.length - 1) / 2
        return get_legal_moves(state).sort((a, b) => {
            const distanceDiff = Math.abs(a - center) - Math.abs(b - center)
            return distanceDiff !== 0 ? distanceDiff : a - b
        })
    }

    function search(state: GameState, depth: number, alpha: number, beta: number): number {
        const status = check_status(state, chain)
        if (status.tag !== 'OnGoing' || depth === maxDepth) {
            return score_game_state(state, chain)
        }

        // P1 looking for MAX
        if (state.current_player === WhichPlayer.P1) {
            let bestScore = -Infinity

            for (const move of ordered_legal_moves(state)) {
                bestScore = Math.max(
                    bestScore,
                    search(apply_move(state, move), depth + 1, alpha, beta),
                )
                alpha = Math.max(alpha, bestScore)
                if (alpha >= beta) break
            }

            return bestScore
        }

        // P2 looking for MIN
        let bestScore = Infinity

        for (const move of ordered_legal_moves(state)) {
            bestScore = Math.min(
                bestScore,
                search(apply_move(state, move), depth + 1, alpha, beta),
            )
            beta = Math.min(beta, bestScore)
            if (alpha >= beta) break
        }

        return bestScore
    }

    // minimax starts HERE
    let bestMove: GameMove | null = null
    let bestScore = s.current_player === WhichPlayer.P1 ? -Infinity : Infinity
    let alpha = -Infinity
    let beta = Infinity

    for (const move of ordered_legal_moves(s)) {
        const score = search(apply_move(s, move), 1, alpha, beta)
        const isBetter = s.current_player === WhichPlayer.P1
            ? score > bestScore
            : score < bestScore

        if (bestMove === null || isBetter) {
            bestMove = move
            bestScore = score
        }

        if (s.current_player === WhichPlayer.P1) {
            alpha = Math.max(alpha, bestScore)
        } else {
            beta = Math.min(beta, bestScore)
        }
    }

    return bestMove
}

export function apply_move(curr_state: GameState, move: GameMove){
    const new_matrix : GamePlace[][]= []
    let row = 0;
    const place = curr_state.current_player === WhichPlayer.P1 ? GamePlace.RED : GamePlace.YELLOW
    for (let i = 0; i < curr_state.matrix.length; i++){
        if(i != move){
            new_matrix.push([...curr_state.matrix[i]])
        }else{
            const target_col = [...curr_state.matrix[i]]
            target_col.reverse();
            const target_index = target_col.indexOf(GamePlace.NONE);
            row = target_col.length - target_index - 1;
            target_col[target_index] = place;
            target_col.reverse();
            new_matrix.push(target_col)
        }
    }

    return {
        matrix: new_matrix,
        current_player: curr_state.current_player === WhichPlayer.P1 ? WhichPlayer.P2 : WhichPlayer.P1,
        drop_coord: {
            col: move,
            row: row
        }
    }
}

