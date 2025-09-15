import React, { useState, useEffect, useCallback } from 'react';

// --- SVG Icons for Cards ---
const EmperorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
  </svg>
);
const CitizenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const SlaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
    <path d="M14 13V8a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v5"/>
    <path d="M8 13v5a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-5"/>
    <path d="M16 13a2 2 0 0 1-2-2h- verduras.2c-.4 0-.8.2-1 .5"/>
    <path d="M8 13a2 2 0 0 0 2 2h.2c.4 0 .8-.2 1-.5"/>
    <path d="M5 10H3.5a2.5 2.5 0 0 1 0-5H5"/>
    <path d="M19 10h1.5a2.5 2.5 0 0 0 0-5H19"/>
  </svg>
);

// --- Game Constants ---
const CARDS = {
    E: { name: "Emperor", icon: <EmperorIcon /> },
    C: { name: "Citizen", icon: <CitizenIcon /> },
    S: { name: "Slave", icon: <SlaveIcon /> }
};
const MAX_ROUNDS = 12;
const ROUNDS_PER_SET = 4;
const EMPEROR_HAND = ['E', 'C', 'C', 'C', 'C'];
const SLAVE_HAND = ['S', 'C', 'C', 'C', 'C'];

// --- Main App Component ---
export default function App() {
    const [gameState, setGameState] = useState('START'); // START, P1_TURN, P2_TURN, REVEAL, ROUND_END, GAME_OVER
    const [round, setRound] = useState(1);
    const [p1Score, setP1Score] = useState(0);
    const [p2Score, setP2Score] = useState(0);

    const [p1Role, setP1Role] = useState('Emperor');
    const [p1Hand, setP1Hand] = useState([]);
    const [p2Hand, setP2Hand] = useState([]);

    const [p1Choice, setP1Choice] = useState(null);
    const [p2Choice, setP2Choice] = useState(null);
    
    const [message, setMessage] = useState("Welcome to the E-Card Game. The Emperor's side begins.");
    const [reveal, setReveal] = useState(false);

    const resetHandsForNewMatch = useCallback(() => {
        const isSwapped = Math.floor((round - 1) / ROUNDS_PER_SET) % 2 !== 0;
        const newP1Role = isSwapped ? 'Slave' : 'Emperor';
        const newP2Role = isSwapped ? 'Emperor' : 'Slave';
        
        setP1Role(newP1Role);
        setP1Hand(newP1Role === 'Emperor' ? [...EMPEROR_HAND] : [...SLAVE_HAND]);
        setP2Hand(newP2Role === 'Emperor' ? [...EMPEROR_HAND] : [...SLAVE_HAND]);
    }, [round]);

    useEffect(() => {
        if (gameState === 'START' || gameState === 'NEXT_MATCH') {
            resetHandsForNewMatch();
            setP1Choice(null);
            setP2Choice(null);
            setReveal(false);
            setGameState('P1_TURN');
            const currentSet = Math.floor((round - 1) / ROUNDS_PER_SET) + 1;
            setMessage(`Match ${round}/${MAX_ROUNDS}. Set ${currentSet}. ${p1Role}'s turn to choose.`);
        }
    }, [gameState, round, p1Role, resetHandsForNewMatch]);

    const handleCardSelect = (player, card, index) => {
        if (player === 'P1' && gameState === 'P1_TURN') {
            setP1Choice(card);
            const newHand = [...p1Hand];
            newHand.splice(index, 1);
            setP1Hand(newHand);
            setGameState('P2_TURN');
            setMessage("Player 2 (Slave's side), choose your card.");
        } else if (player === 'P2' && gameState === 'P2_TURN') {
            setP2Choice(card);
            const newHand = [...p2Hand];
            newHand.splice(index, 1);
            setP2Hand(newHand);
            setGameState('REVEAL');
            setMessage('Both players have chosen. Reveal the cards!');
        }
    };
    
    const determineWinner = () => {
        setReveal(true);
        const p2Role = p1Role === 'Emperor' ? 'Slave' : 'Emperor';
        let roundWinner = null; // P1, P2, DRAW
        let winnerMessage = "";

        if (p1Choice === p2Choice) {
            roundWinner = 'DRAW';
            winnerMessage = "It's a draw! The cards are discarded.";
        } else if (
            (p1Choice === 'E' && p2Choice === 'C') ||
            (p1Choice === 'C' && p2Choice === 'S')
        ) {
            roundWinner = p1Role === 'Emperor' ? 'P1' : 'P2';
        } else if (
            (p2Choice === 'E' && p1Choice === 'C') ||
            (p2Choice === 'C' && p1Choice === 'S')
        ) {
            roundWinner = p2Role === 'Emperor' ? 'P2' : 'P1';
        } else if (p1Choice === 'E' && p2Choice === 'S') {
            roundWinner = p1Role === 'Emperor' ? 'P2' : 'P1'; // Slave side wins
        } else if (p2Choice === 'E' && p1Choice === 'S') {
            roundWinner = p2Role === 'Emperor' ? 'P1' : 'P2'; // Slave side wins
        }
        
        if (roundWinner !== 'DRAW') {
             const winningSide = (roundWinner === 'P1' ? p1Role : p2Role);
             const points = winningSide === 'Slave' ? 5 : 1;
             winnerMessage = `${winningSide} side wins this match and gets ${points} point(s)!`;
             if(roundWinner === 'P1') setP1Score(s => s + points);
             else setP2Score(s => s + points);
        }
        
        setMessage(winnerMessage);
        setGameState('ROUND_END');
    };
    
    const handleNextAction = () => {
        if (gameState === 'ROUND_END') {
            if (p1Hand.length === 0 || (p1Choice !== p2Choice)) { // Match ends on win/loss or out of cards
                if (round + 1 > MAX_ROUNDS) {
                    setGameState('GAME_OVER');
                     const finalWinner = p1Score > p2Score ? "Player 1" : (p2Score > p1Score ? "Player 2" : "No one");
                    setMessage(`Game Over! ${finalWinner} wins the gamble!`);
                } else {
                    setRound(r => r + 1);
                    setGameState('NEXT_MATCH');
                }
            } else { // It was a draw, continue with remaining cards
                setP1Choice(null);
                setP2Choice(null);
                setReveal(false);
                setGameState('P1_TURN');
                setMessage(`Match ${round}/${MAX_ROUNDS}. Cards discarded. ${p1Role}'s turn.`);
            }
        }
    };

    const restartGame = () => {
        setGameState('START');
        setRound(1);
        setP1Score(0);
        setP2Score(0);
        setP1Role('Emperor');
        setP1Choice(null);
        setP2Choice(null);
        setMessage("A new game begins. The Emperor's side starts.");
    };

    const Card = ({ card, isPlayer, isFaceDown, onClick }) => {
        const baseStyle = "w-24 h-36 md:w-32 md:h-48 m-2 rounded-lg shadow-lg border-2 flex flex-col items-center justify-center transition-all duration-300 transform";
        const playerStyle = "cursor-pointer hover:scale-105 hover:shadow-2xl hover:-translate-y-2";
        const faceDownStyle = "bg-gray-700 border-gray-500";
        const faceUpStyle = "bg-gray-800 border-gray-400";
        
        if(isFaceDown) {
            return (
                <div className={`${baseStyle} ${faceDownStyle}`}>
                    <div className="text-5xl text-red-600 font-serif">?</div>
                </div>
            );
        }
        
        return (
            <div className={`${baseStyle} ${faceUpStyle} ${isPlayer ? playerStyle : ''}`} onClick={onClick}>
                {CARDS[card].icon}
                <span className="text-white font-bold mt-2 text-lg">{CARDS[card].name}</span>
            </div>
        );
    };

    return (
        <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
            <div className="w-full max-w-7xl mx-auto z-10">
                
                {/* --- Game Header --- */}
                <header className="text-center mb-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-red-600 tracking-wider font-serif">E-CARD</h1>
                    <p className="text-gray-400">A Game of Deception and Power</p>
                </header>

                {/* --- Player 2 (Top) --- */}
                <div className="player-area mb-4 min-h-[220px]">
                    <h2 className="text-xl text-center mb-2">
                        Player 2 <span className="text-sm font-mono p-1 rounded bg-gray-700">{p1Role === 'Emperor' ? "Slave" : "Emperor"} Side</span>
                    </h2>
                    <div className="flex justify-center flex-wrap">
                       {p2Hand.map((card, i) => (
                           <Card 
                               key={i} 
                               card={card} 
                               isPlayer={gameState === 'P2_TURN'} 
                               isFaceDown={gameState !== 'P2_TURN'} 
                               onClick={() => handleCardSelect('P2', card, i)} 
                           />
                       ))}
                       {p2Hand.length === 0 && !p2Choice && <div className="text-gray-500 italic">No cards left</div>}
                    </div>
                </div>

                {/* --- Game Board (Middle) --- */}
                <div className="game-board bg-black bg-opacity-40 rounded-xl shadow-2xl p-4 md:p-6 my-4 border border-gray-700 flex flex-col items-center min-h-[300px]">
                    <div className="flex justify-between w-full text-lg mb-4">
                        <div className="p-2 bg-blue-900 rounded-lg">P1 Score: <span className="font-bold">{p1Score}</span></div>
                        <div className="p-2 font-bold text-2xl">Match: {round}</div>
                        <div className="p-2 bg-red-900 rounded-lg">P2 Score: <span className="font-bold">{p2Score}</span></div>
                    </div>
                    
                    <div className="flex items-center justify-around w-full flex-grow my-4">
                        <div className="flex flex-col items-center">
                            <h3 className="mb-2">Player 1's Play</h3>
                            {p1Choice ? <Card card={p1Choice} isFaceDown={!reveal} /> : <div className="w-24 h-36 md:w-32 md:h-48 rounded-lg bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center"><span className="text-gray-500">Waiting...</span></div>}
                        </div>
                        
                        <div className="text-4xl font-bold text-red-500 animate-pulse">VS</div>
                        
                        <div className="flex flex-col items-center">
                            <h3 className="mb-2">Player 2's Play</h3>
                            {p2Choice ? <Card card={p2Choice} isFaceDown={!reveal} /> : <div className="w-24 h-36 md:w-32 md:h-48 rounded-lg bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center"><span className="text-gray-500">Waiting...</span></div>}
                        </div>
                    </div>

                    <div className="text-center min-h-[60px] flex flex-col justify-center items-center mt-4">
                        <p className="text-xl text-yellow-300 mb-2">{message}</p>
                        {gameState === 'REVEAL' && <button onClick={determineWinner} className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors">REVEAL</button>}
                        {gameState === 'ROUND_END' && <button onClick={handleNextAction} className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors">Continue</button>}
                        {gameState === 'GAME_OVER' && <button onClick={restartGame} className="px-6 py-2 bg-yellow-500 text-black hover:bg-yellow-600 rounded-lg font-bold transition-colors">Play Again</button>}
                    </div>
                </div>

                {/* --- Player 1 (Bottom) --- */}
                <div className="player-area mt-4 min-h-[220px]">
                     <h2 className="text-xl text-center mb-2">
                        Player 1 <span className="text-sm font-mono p-1 rounded bg-gray-700">{p1Role} Side</span>
                    </h2>
                    <div className="flex justify-center flex-wrap">
                        {p1Hand.map((card, i) => (
                           <Card 
                               key={i} 
                               card={card} 
                               isPlayer={gameState === 'P1_TURN'} 
                               onClick={() => handleCardSelect('P1', card, i)} 
                           />
                       ))}
                       {p1Hand.length === 0 && !p1Choice && <div className="text-gray-500 italic">No cards left</div>}
                    </div>
                </div>
            </div>
        </main>
    );
}

