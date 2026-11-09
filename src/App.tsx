import { useState } from "react";
import { create_an_empty_connect4_game_state, get_legal_moves } from "./utils/game";
import { Mode } from "./types";

const ROW = 5
const COL = 6

function App(){
    const [gameState, setGameState] = useState(create_an_empty_connect4_game_state(ROW, COL));
    const [mode, setMode] = useState<Mode>(Mode.HumanHuman)

    function handleColClick(colIndex: number){
        // check legal move
        const legalMoves = get_legal_moves(gameState)
        if(!legalMoves.includes(colIndex)) {
            console.warn("Not a valid step!");
            return
        }

        // check if it's already win or draw
        const current_status = 
    }

    function handleModeChange(newMode: Mode){
        
    }

    return (
        <div className="app">
            <main className="app-main">
                {/* mode switch */}
                <select value={mode} onChange={e => handleModeChange(e.target.value)}>
                    {Object.values(Mode).map(m => {
                        return (
                            <option value={m} id={m} key={m}>{m}</option>
                        )
                    })}
                </select>
                {/* game board */}
                {Array.from({ length: ROW }, (_, row) => 
                    Array.from({ length: COL}, (_, col) => {
                        const place = gameState.matrix[col][row]

                        return (
                            <div className="cell" key={`col-${col}-row-${row}`}
                                onClick={() => handleColClick(col)}
                            ></div>
                        )
                    })
                )}
            </main>
        </div>
    )
}

export default App;
