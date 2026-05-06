import React from 'react';
import Game from './Game';

const GameContainer = ({ onGameOver, setScore, onExit, initialState }) => {
    return (
        <div className="w-full h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">

            {/* Optional: Add a subtle retro grid background or just keep it black */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
                backgroundSize: "40px 40px"
            }}>
            </div>

            {/* Game Canvas */}
            <div className="z-10 w-full h-full flex items-center justify-center relative">
                <Game onGameOver={onGameOver} onScoreUpdate={setScore} initialState={initialState} />

                {/* Quit Button (Always visible or only on pause?) - Let's keep it simple for now, maybe top right */}
                <button
                    onClick={onExit}
                    className="absolute top-4 right-4 bg-red-600 border-4 border-white text-white px-4 py-2 font-black uppercase text-xs z-50 shadow-pixel hover:shadow-pixel-hover active:translate-y-1 transition-all">
                    Exit
                </button>
            </div>

        </div>
    );
};

export default GameContainer;
