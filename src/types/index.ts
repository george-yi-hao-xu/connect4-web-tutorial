export enum WhichPlayer {
    P1 = 'P1',
    P2 = 'P2'
}

export enum Mode {
     HumanHuman = "human vs human",
     HumanAi = "human vs ai",
     AiAi = "ai vs ai"
}

export type Status =
    | { tag: 'Win'; player: WhichPlayer}
    | { tag: 'Draw';}
    | { tag: 'OnGoing'; player: WhichPlayer};

export interface CellCoord {
    col: number;
    row: number;
}

export enum GamePlace {
    RED = 'RED',
    YELLOW = 'YELLOW',
    NONE = 'NONE'
}

export type GameMove = number;
export type GameState = {
    matrix: GamePlace[][],
    current_player: WhichPlayer,
}

// export interface GameState{
//     matrix: GamePlace[][];
//     get_legal_moves(): GameMove[];
//     get_status(): Status;
//     get_score(): number;
//     calc_next_state(move: GameMove): GameState;
// }
