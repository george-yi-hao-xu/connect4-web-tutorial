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

export function apply_move(curr_state: GameState, move: GameMove): GameState{
    const new_matrix : GamePlace[][]= []
    const place = curr_state.current_player === WhichPlayer.P1 ? GamePlace.RED : GamePlace.YELLOW
    for (let i = 0; i < curr_state.matrix.length; i++){
        if(i != move){
            new_matrix.push([...curr_state.matrix[i]])
        }else{
            const target_col = [...curr_state.matrix[i]]
            target_col.reverse();
            const target_index = target_col.indexOf(GamePlace.NONE);
            target_col[target_index] = place;
            target_col.reverse();
            new_matrix.push(target_col)
        }
    }

    return {
        matrix: new_matrix,
        current_player: curr_state.current_player === WhichPlayer.P1 ? WhichPlayer.P2 : WhichPlayer.P1
    }
}

