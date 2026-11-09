import { useState } from "react";
import { apply_move, check_status, create_an_empty_connect4_game_state, get_legal_moves } from "./utils/game";
import { Mode, Status, WhichPlayer } from "./types";

import "./App.scss"

const ROW = 5
const COL = 6

function App(){
    const [gameState, setGameState] = useState(create_an_empty_connect4_game_state(ROW, COL));
    const [gameStatus, setGameStatus] = useState<Status>({tag: 'OnGoing', player: WhichPlayer.P1 } as Status)
    const [mode, setMode] = useState<Mode>(Mode.HumanHuman)

    function handleColClick(colIndex: number){
        // check legal move
        const legalMoves = get_legal_moves(gameState)
        if(!legalMoves.includes(colIndex)) {
            console.warn("Not a valid step!");
            return
        }

        // check if it's already win or draw
        const current_status = check_status(gameState, 4);
        setGameStatus(current_status);
        if (current_status.tag != 'OnGoing') {
            console.log('Invalid Input; Game has been over');
            return
        }

        const new_game_state = apply_move(gameState, colIndex);
        setGameState(new_game_state);
        const new_status = check_status(new_game_state, 4);
        setGameStatus(new_status);
    }

    function handleModeChange(newMode: Mode){
        
    }

    return (
        <div className="app">
            <main className="app-main">
                {/* mode switch */}
                <select value={mode} onChange={e => handleModeChange(e.target.value as Mode)}>
                    {Object.values(Mode).map(m => {
                        return (
                            <option value={m} id={m} key={m}>{m}</option>
                        )
                    })}
                </select>

                {/* game board */}
                <div className="game-board">
                    {Array.from({ length: ROW }, (_, row) => {
                        return <div className="cell-row" key={row}>
                            {Array.from({ length: COL}, (_, col) => {
                                const place = gameState.matrix[col][row];
                                const winning = Boolean(gameStatus.winning_cells?.some(cell => cell.col == col && cell.row == row))

                                return (
                                    <div className={`cell ${place} ${winning ? 'winning' : ''} ${gameStatus.tag !== 'OnGoing' ? 'finished' : ''}`} 
                                        key={`col-${col}-row-${row}`}
                                        onClick={() => handleColClick(col)}
                                    ></div>
                                )
                            })}
                        </div>
                        }
                    )}
                </div>

                {/* Status board */}
                <div className="status-board">
                    <span>{gameStatus.tag}</span>
                </div>
            </main>
        </div>
    )
}

export default App;
