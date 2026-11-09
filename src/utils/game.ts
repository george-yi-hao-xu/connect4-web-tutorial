import { GameMove, GamePlace, GameState, Mode, WhichPlayer } from "../types";

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

export function check_status(s: GameState) {
    
}
