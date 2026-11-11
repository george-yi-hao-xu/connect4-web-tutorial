import { useEffect, useState } from "react";
import { apply_move, check_status, create_an_empty_connect4_game_state, get_legal_moves, minimax } from "./utils/game";
import { Difficulty, GameState, Mode, Status, WhichPlayer } from "./types";

import "./App.scss"

const ROW = 5
const COL = 6
const CHAIN = 4
const AI_DEPTH: Record<Difficulty, number> = {
    [Difficulty.Easy]: 1,
    [Difficulty.Normal]: 3,
    [Difficulty.Hard]: 5,
}

function App(){
    const [gameState, setGameState] = useState<GameState>(create_an_empty_connect4_game_state(ROW, COL));
    const [gameStatus, setGameStatus] = useState<Status>({tag: 'OnGoing', player: WhichPlayer.P1 } as Status)
    const [mode, setMode] = useState<Mode>(Mode.HumanAi)
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Normal)

    const [lock, setLock] = useState(false);
    const [hint, setHint] = useState<{ col: number } | null>(null)

    function handleColClick(colIndex: number){
        if (lock) {
            console.warn('board locked')
            return
        }

        if (mode === Mode.AiAi
            || (mode === Mode.HumanAi && gameState.current_player !== WhichPlayer.P1)) {
            return
        }

        // check legal move
        const legalMoves = get_legal_moves(gameState)
        if(!legalMoves.includes(colIndex)) {
            console.warn("Not a valid step!");
            return
        }

        // check if it's already win or draw
        const current_status = check_status(gameState, CHAIN);
        setGameStatus(current_status);
        if (current_status.tag != 'OnGoing') {
            console.log('Invalid Input; Game has been over');
            return
        }

        const human_game_state = apply_move(gameState, colIndex);
        const human_status = check_status(human_game_state, CHAIN);

        // trigger ai move
        if (mode === Mode.HumanAi && human_status.tag === 'OnGoing') {
            const ai_move = minimax(human_game_state, CHAIN, AI_DEPTH[difficulty])
            setLock(true);

            setTimeout(() => {
                if (ai_move !== null) {
                    const ai_game_state = apply_move(human_game_state, ai_move)
                    setGameState(ai_game_state)
                    setGameStatus(check_status(ai_game_state, CHAIN))
                    setLock(false)
                    return
            }}, 500)
        }

        setGameState(human_game_state);
        setGameStatus(human_status);
    }

    function handleModeChange(newMode: Mode){
        const new_game_state = create_an_empty_connect4_game_state(ROW, COL)
        setMode(newMode);
        setLock(false);
        setGameState(new_game_state);
        setGameStatus(check_status(new_game_state, CHAIN));

        if (newMode === Mode.AiAi) {
            let ai_game_state = new_game_state
            let ai_status = check_status(ai_game_state, CHAIN)
            const jobs = []

            while (ai_status.tag === 'OnGoing') {
                const ai_move = minimax(ai_game_state, CHAIN, AI_DEPTH[difficulty])
                if (ai_move === null) break

                ai_game_state = apply_move(ai_game_state, ai_move)
                ai_status = check_status(ai_game_state, CHAIN)
                const state_snapshot = ai_game_state
                const status_snapshot = ai_status

                jobs.push(() => {
                    setGameState(state_snapshot)
                    setGameStatus(status_snapshot)
                })
            }

            jobs.forEach((job, index) => {
                setTimeout(() => {
                    job()
                }, index * 500)
            })

            return
        }
    }

    function handleHint(){
        const isHumanTurn = mode === Mode.HumanHuman
            || (mode === Mode.HumanAi && gameState.current_player === WhichPlayer.P1)

        if (lock || gameStatus.tag !== 'OnGoing' || !isHumanTurn) {
            return
        }

        const bestMove = minimax(gameState, CHAIN, AI_DEPTH[Difficulty.Hard])
        setHint(bestMove === null ? null : { col: bestMove })
        setTimeout(() => setHint(null), 1500)
    }

    // helper
    const finished = gameStatus.tag !== 'OnGoing'
    const displayedPlayer = gameStatus.tag === 'OnGoing'
        ? gameState.current_player
        : gameStatus.tag === 'Win'
            ? gameStatus.player
            : undefined
    const statusText = gameStatus.tag === 'Draw'
        ? 'Draw'
        : gameStatus.tag === 'Win'
            ? `${gameStatus.player} wins`
            : `${gameState.current_player}'s turn`
    const canRequestHint = !lock
        && gameStatus.tag === 'OnGoing'
        && (mode === Mode.HumanHuman
            || (mode === Mode.HumanAi && gameState.current_player === WhichPlayer.P1))

    return (
        <div className="app">
            <main className="app-main">
                <div className="hint-btn-container">
                    {mode !== Mode.AiAi && (
                        <button
                            type="button"
                            aria-label="Show best move hint"
                            disabled={!canRequestHint}
                            onClick={handleHint}
                            className="hint-button"
                        >
                            Show Hint
                        </button>
                    )}
                </div>

                {/* game board */}
                <div className="game-board">
                    {Array.from({ length: COL }, (_, col) => {
                        return <div className={`cell-col ${finished ? 'finished' : ''} ${hint?.col === col ? 'hint' : ''}`} key={col}>
                            {Array.from({ length: ROW}, (_, row) => {
                                const place = gameState.matrix[col][row];
                                const winning = Boolean(gameStatus.winning_cells?.some(cell => cell.col == col && cell.row == row))
                                const last = Boolean(gameState.drop_coord?.col === col && gameState.drop_coord?.row === row)

                                return (
                                    <div className={`cell ${place} ${winning ? 'winning' : ''} ${finished ? 'finished' : ''} ${last ? 'last' : ''}`} 
                                        key={`col-${col}-row-${row}`}
                                        onClick={() => handleColClick(col)}
                                    ></div>
                                )
                            })}
                        </div>
                        }
                    )}
                </div>

                {/* mode switch */}
                <div className="control">
                    <div className="turn-status" role="status" aria-live="polite">
                        {displayedPlayer && (
                            <span className={`turn-indicator ${displayedPlayer}`} aria-hidden="true"></span>
                        )}
                        <span>{statusText}</span>
                    </div>

                    <div className="control-actions">
                        <select value={mode} onChange={e => handleModeChange(e.target.value as Mode)}>
                            {Object.values(Mode).map(m => {
                                return (
                                    <option value={m} id={m} key={m}>{m}</option>
                                )
                            })}
                        </select>
                        {mode !== Mode.HumanHuman && (
                            <select
                                aria-label="AI difficulty"
                                value={difficulty}
                                onChange={e => setDifficulty(e.target.value as Difficulty)}
                            >
                                {Object.values(Difficulty).map(level => (
                                    <option value={level} key={level}>{level}</option>
                                ))}
                            </select>
                        )}

                        <button onClick={() => handleModeChange(mode)}>Refresh</button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default App;
