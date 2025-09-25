import React, { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot, updateDoc, collection, addDoc, getDoc } from "firebase/firestore";
import { db } from './firebase.js';


// --- Game Constants ---
const EMPEROR = "E";
const CITIZEN = "C";
const SLAVE = "S";
const MAX_ROUNDS = 12;
const SWAP_ROUND = 4; // Swaps after round 4 (starting from round 5)

// --- Helper Functions ---
const getInitialHand = (role) => {
    return role === 'emperor' ? [EMPEROR, ...Array(4).fill(CITIZEN)] : [SLAVE, ...Array(4).fill(CITIZEN)];
};

// --- Child Components ---

const Card = ({ value, isSelected, onClick, isDisabled }) => {
    const baseStyle = "w-20 h-28 md:w-28 md:h-40 rounded-lg flex items-center justify-center text-white font-bold text-2xl md:text-4xl shadow-lg transition-all duration-200 transform hover:scale-105";
    const selectedStyle = "ring-4 ring-yellow-400 scale-105 shadow-yellow-500/50";
    const disabledStyle = "opacity-50 cursor-not-allowed";

    const getCardStyle = (card) => {
        switch (card) {
            case EMPEROR: return "bg-gradient-to-br from-purple-600 to-indigo-800";
            case CITIZEN: return "bg-gradient-to-br from-gray-600 to-gray-800";
            case SLAVE: return "bg-gradient-to-br from-red-600 to-red-800";
            default: return "bg-gray-700";
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`${baseStyle} ${getCardStyle(value)} ${isSelected ? selectedStyle : ''} ${isDisabled ? disabledStyle : ''}`}
        >
            {value}
        </button>
    );
};

const GameLobby = ({ createGame, joinGame, gameIdInput, setGameIdInput, error }) => (
    <div className="w-full max-w-md mx-auto bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl text-center">
        <h1 className="text-5xl font-extrabold text-white mb-2">E-CARD</h1>
        <p className="text-yellow-400 mb-8 font-semibold">The Emperor's Gamble</p>

        <button
            onClick={createGame}
            className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 mb-4 text-lg"
        >
            Create New Game
        </button>

        <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-600" />
            <span className="px-4 text-gray-400 font-bold">OR</span>
            <hr className="flex-grow border-gray-600" />
        </div>

        <div className="space-y-4">
            <input
                type="text"
                placeholder="Enter Game ID"
                value={gameIdInput}
                onChange={(e) => setGameIdInput(e.target.value.trim())}
                className="w-full text-center bg-gray-700 text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
                onClick={joinGame}
                className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 text-lg"
            >
                Join Game
            </button>
        </div>
        {error && <p className="text-red-500 mt-4 animate-pulse">{error}</p>}
    </div>
);


// --- Main App Component ---
function App() {
    const [gameId, setGameId] = useState(null);
    const [gameData, setGameData] = useState(null);
    const [playerId, setPlayerId] = useState(null);
    const [gameIdInput, setGameIdInput] = useState("");
    const [error, setError] = useState("");
    const [selectedCard, setSelectedCard] = useState(null);
    const [selectedCardIndex, setSelectedCardIndex] = useState(null);
    
    // Fix race condition: Use ref to access latest gameData without dependency issues
    // Problem: gameData changes frequently → nextRound recreated → useEffect runs → multiple timers
    // Solution: Use ref to access current gameData without adding it to useCallback dependencies
    const gameDataRef = useRef();
    gameDataRef.current = gameData;

    // Persist playerId in localStorage
    useEffect(() => {
        const storedPlayerId = localStorage.getItem('e-card-playerId');
        if (storedPlayerId) {
            setPlayerId(storedPlayerId);
        } else {
            const newPlayerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            localStorage.setItem('e-card-playerId', newPlayerId);
            setPlayerId(newPlayerId);
        }
    }, []);

    // Subscribe to game updates
    useEffect(() => {
        if (!gameId) return;
        const unsub = onSnapshot(doc(db, "games", gameId), (doc) => {
            if (doc.exists()) {
                setGameData(doc.data());
            } else {
                setError("Game not found. It might have been deleted.");
                setGameId(null);
            }
        });
        return () => unsub();
    }, [gameId]);


    const createGame = async () => {
        if (!playerId) return;
        const initialHand = getInitialHand('emperor');
        const newGameRef = await addDoc(collection(db, "games"), {
            players: { [playerId]: { role: 'emperor', score: 0, hand: initialHand } },
            round: 1,
            playerCount: 1,
            status: 'waiting',
            choices: {},
            roundWinner: null,
            lastRoundResult: null,
            createdAt: new Date(),
        });
        setGameId(newGameRef.id);
        setError("");
    };

    const joinGame = async () => {
        if (!gameIdInput || !playerId) return;
        const gameRef = doc(db, "games", gameIdInput);
        const gameSnap = await getDoc(gameRef);

        if (gameSnap.exists()) {
            const game = gameSnap.data();
            if (game.playerCount < 2 && !game.players[playerId]) {
                 const initialHand = getInitialHand('slave');
                 await updateDoc(gameRef, {
                    [`players.${playerId}`]: { role: 'slave', score: 0, hand: initialHand },
                    playerCount: 2,
                    status: 'playing',
                });
                setGameId(gameIdInput);
                setError("");
            } else if (game.players[playerId]) {
                setGameId(gameIdInput); // Allow rejoining
                setError("");
            } else {
                setError("Game is already full.");
            }
        } else {
            setError("Game ID not found.");
        }
    };


    const playCard = async () => {
        if (!selectedCard || selectedCardIndex === null || !gameData || !playerId) return;

        const myCurrentHand = gameData.players[playerId]?.hand;
        if (!myCurrentHand || selectedCardIndex < 0 || selectedCardIndex >= myCurrentHand.length) {
            setError("Invalid card choice.");
            return;
        }

        // Use the selectedCardIndex for precise card removal
        const newHand = [...myCurrentHand];
        newHand.splice(selectedCardIndex, 1);
        
        await updateDoc(doc(db, "games", gameId), {
            [`choices.${playerId}`]: selectedCard,
            [`players.${playerId}.hand`]: newHand
        });
        setSelectedCard(null); // Deselect after playing
        setSelectedCardIndex(null);
    };

    const nextRound = useCallback(async () => {
        // Use ref to get latest gameData without causing dependency issues
        const currentGameData = gameDataRef.current;
        if (!currentGameData || Object.keys(currentGameData.players).length < 2) return;

        let { round, players } = currentGameData;
        const playerIds = Object.keys(players);
        const emperorPlayerId = playerIds.find(id => players[id].role === 'emperor');
        const slavePlayerId = playerIds.find(id => players[id].role === 'slave');

        if (!emperorPlayerId || !slavePlayerId || !currentGameData.choices[emperorPlayerId] || !currentGameData.choices[slavePlayerId]) {
            return; 
        }

        const emperorChoice = currentGameData.choices[emperorPlayerId];
        const slaveChoice = currentGameData.choices[slavePlayerId];
        let winnerId = null;

        // Determine winner based on card interactions
        if (emperorChoice === EMPEROR && slaveChoice === SLAVE) {
            winnerId = slavePlayerId;
        } else if (emperorChoice === EMPEROR && slaveChoice === CITIZEN) {
            winnerId = emperorPlayerId;
        } else if (emperorChoice === CITIZEN && slaveChoice === SLAVE) {
            winnerId = emperorPlayerId;
        } else if (emperorChoice === CITIZEN && slaveChoice === CITIZEN) {
            winnerId = null; // Draw
        }
        
        const lastRoundResult = {
            [emperorPlayerId]: emperorChoice,
            [slavePlayerId]: slaveChoice,
            winnerId: winnerId,
        };

        if (winnerId) {
            // WINNER - END OF ROUND
            players[winnerId].score += (winnerId === slavePlayerId && emperorChoice === EMPEROR) ? 5 : 1;
            
            const newRound = round + 1;
            let newEmperorRole = players[emperorPlayerId].role;
            let newSlaveRole = players[slavePlayerId].role;
            
            // Role swap logic: swap roles after completing round 4
            // This means roles swap when round === 4 (after round 4 finishes, starting round 5)
            if (round === SWAP_ROUND) {
                newEmperorRole = 'slave';
                newSlaveRole = 'emperor';
            }
    
            players[emperorPlayerId].role = newEmperorRole;
            players[slavePlayerId].role = newSlaveRole;
            
            players[emperorPlayerId].hand = getInitialHand(newEmperorRole);
            players[slavePlayerId].hand = getInitialHand(newSlaveRole);
            
            await updateDoc(doc(db, "games", gameId), {
                round: newRound,
                status: newRound > MAX_ROUNDS ? 'finished' : 'playing',
                choices: {},
                roundWinner: winnerId,
                lastRoundResult: lastRoundResult,
                players: players
            });
        } else {
            // DRAW - ROUND CONTINUES
            await updateDoc(doc(db, "games", gameId), {
                choices: {},
                roundWinner: null,
                lastRoundResult: lastRoundResult,
            });
        }
    }, [gameId]); // Removed gameData from dependencies to prevent race condition

    useEffect(() => {
        if (gameData && gameData.status === 'playing' && Object.keys(gameData.choices).length === 2) {
           const timer = setTimeout(() => {
                nextRound();
           }, 4000); // Wait 4 seconds to show results
           return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameData]); // nextRound intentionally excluded to prevent race condition


    // --- Render Logic ---

    if (!playerId) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
    }

    if (!gameId || !gameData) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center p-4">
                <GameLobby
                    createGame={createGame}
                    joinGame={joinGame}
                    gameIdInput={gameIdInput}
                    setGameIdInput={setGameIdInput}
                    error={error}
                />
            </main>
        );
    }
    
    // --- In-Game Render ---
    const myRole = gameData.players[playerId]?.role;
    const opponentId = Object.keys(gameData.players).find(id => id !== playerId);
    const opponent = opponentId ? gameData.players[opponentId] : null;
    const myHand = gameData.players[playerId]?.hand || [];

    const myChoice = gameData.choices[playerId];
    const opponentChoice = opponentId ? gameData.choices[opponentId] : null;

    // Check if both players have made choices (waiting for next round)
    const isWaitingForNextRound = Object.keys(gameData.choices).length === 2;
    
    // Calculate current round result immediately when both players have played
    let currentRoundResult = null;
    if (isWaitingForNextRound && myChoice && opponentChoice) {
        const emperorPlayerId = Object.keys(gameData.players).find(id => gameData.players[id].role === 'emperor');
        const slavePlayerId = Object.keys(gameData.players).find(id => gameData.players[id].role === 'slave');
        
        const emperorChoice = gameData.choices[emperorPlayerId];
        const slaveChoice = gameData.choices[slavePlayerId];
        
        let winnerId = null;
        // Same logic as nextRound function
        if (emperorChoice === 'E' && slaveChoice === 'S') {
            winnerId = slavePlayerId;
        } else if (emperorChoice === 'E' && slaveChoice === 'C') {
            winnerId = emperorPlayerId;
        } else if (emperorChoice === 'C' && slaveChoice === 'S') {
            winnerId = emperorPlayerId;
        } else if (emperorChoice === 'C' && slaveChoice === 'C') {
            winnerId = null; // Draw
        }
        
        currentRoundResult = {
            [emperorPlayerId]: emperorChoice,
            [slavePlayerId]: slaveChoice,
            winnerId: winnerId,
        };
    }
    
    // Show the current round result when both players have played
    const showRoundResult = currentRoundResult !== null;


    if (gameData.status === 'waiting') {
        return (
            <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
                 <h2 className="text-3xl font-bold mb-4">Waiting for Opponent...</h2>
                 <p className="text-gray-400 mb-6">Share this Game ID with a friend:</p>
                 <div className="bg-gray-800 p-4 rounded-lg cursor-pointer" onClick={() => navigator.clipboard.writeText(gameId)}>
                    <strong className="text-2xl font-mono tracking-widest text-yellow-400">{gameId}</strong>
                    <p className="text-xs text-gray-500 mt-2">Click to copy</p>
                 </div>
            </main>
        )
    }

    if (gameData.status === 'finished') {
        const myFinalScore = gameData.players[playerId]?.score || 0;
        const opponentFinalScore = opponent?.score || 0;
        let resultMessage = "The game is a draw.";
        if (myFinalScore > opponentFinalScore) resultMessage = "You are victorious!";
        if (myFinalScore < opponentFinalScore) resultMessage = "You have been defeated.";

        return (
             <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 text-center">
                 <h2 className="text-5xl font-bold mb-4">Game Over</h2>
                 <p className="text-2xl text-yellow-400 mb-8">{resultMessage}</p>
                 <div className="text-xl space-y-2">
                    <p>Your Score: <strong className="text-white text-2xl">{myFinalScore}</strong></p>
                    <p>Opponent's Score: <strong className="text-white text-2xl">{opponentFinalScore}</strong></p>
                 </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 pt-8 sm:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">Round {gameData.round} / {MAX_ROUNDS}</h1>
                        <p className="text-gray-400 text-sm">Game ID: {gameId}</p>
                    </div>
                    <div className="text-right">
                        <p>You: <span className="font-bold">{gameData.players[playerId]?.score || 0}</span></p>
                        <p>Opponent: <span className="font-bold">{opponent?.score || 0}</span></p>
                    </div>
                </div>

                {/* Opponent Area */}
                <div className="mb-8 p-4 bg-black/30 rounded-lg min-h-[12rem] flex flex-col items-center justify-center border-2 border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-400 mb-2">Opponent's Side</h2>
                    <div className="flex items-center justify-center">
                        {opponentChoice ? (
                            <div className="text-center">
                                <p className="mb-2">Opponent has played</p>
                                <div className="w-20 h-28 md:w-28 md:h-40 rounded-lg bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-white font-bold text-5xl shadow-lg">
                                    ?
                                </div>
                            </div>
                        ) : (
                             <div className="w-20 h-28 md:w-28 md:h-40 rounded-lg bg-gray-700 animate-pulse flex items-center justify-center">
                                <span className="text-gray-400 text-sm">Waiting</span>
                             </div>
                        )}
                    </div>
                </div>

                {/* Player Area */}
                <div className="p-4 bg-black/30 rounded-lg min-h-[20rem] flex flex-col items-center justify-center border-2 border-blue-800/50">
                    <h2 className="text-lg font-semibold text-yellow-400 mb-2">Your Side - Role: <span className="capitalize">{myRole}</span></h2>
                    {myChoice ? (
                         <div className="text-center">
                            <p className="mb-2">You Played:</p>
                            <Card value={myChoice} isDisabled={true} />
                            <p className="mt-4 text-gray-400 animate-pulse">Waiting for opponent...</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex space-x-2 sm:space-x-4 mb-6">
                                {myHand.map((card, index) => (
                                    <Card
                                        key={`${card}-${index}`}
                                        value={card}
                                        isSelected={selectedCardIndex === index}
                                        onClick={() => {
                                            setSelectedCard(card);
                                            setSelectedCardIndex(index);
                                        }}
                                    />
                                ))}
                            </div>
                             <button
                                onClick={playCard}
                                disabled={!selectedCard}
                                className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300"
                            >
                                Confirm Play
                            </button>
                        </>
                    )}
                </div>

                {/* Round Result Modal */}
                {isWaitingForNextRound && showRoundResult && currentRoundResult && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl text-center animate-fade-in-up">
                             <h3 className="text-3xl font-bold mb-4">Round {gameData.round} Result</h3>
                            <div className="flex justify-center space-x-8 mb-6">
                                <div>
                                    <p className="font-semibold">You Played</p>
                                    <Card value={currentRoundResult[playerId]} isDisabled={true} />
                                </div>
                                {opponentId && currentRoundResult[opponentId] && (
                                  <div>
                                      <p className="font-semibold">Opponent Played</p>
                                      <Card value={currentRoundResult[opponentId]} isDisabled={true} />
                                  </div>
                                )}
                            </div>
                            {currentRoundResult.winnerId ? (
                                <p className="text-2xl text-yellow-400">
                                    {currentRoundResult.winnerId === playerId ? "You Win This Round!" : "You Lose This Round."}
                                </p>
                            ) : (
                                <p className="text-2xl text-gray-400">Draw! The round continues.</p>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}

export default App;

