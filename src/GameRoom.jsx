import React from 'react';

const GameRoom = ({ 
    wallet, 
    connectWallet, 
    user, 
    payAndPlay, 
    claimBonus, 
    prizePool, 
    status, 
    onBack 
}) => {
    return (
        <div className="min-h-screen bg-secondary text-white font-display antialiased flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-pixel-pattern pointer-events-none"></div>
            <div className="absolute -top-24 -left-24 size-64 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 size-64 bg-primary/20 rounded-full blur-3xl"></div>

            {/* Header / Back Button */}
            <div className="absolute top-8 left-8">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Hub
                </button>
            </div>

            {/* Main Content Card */}
            <div className="max-w-xl w-full z-10">
                <div className="bg-white text-secondary p-8 border-8 border-primary pixel-shadow relative">
                    {/* Header Label */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-secondary text-primary px-6 py-2 border-4 border-primary font-black uppercase tracking-[0.2em] text-sm transform -rotate-1">
                        Gameroom
                    </div>

                    {/* Connection Status */}
                    <div className="flex flex-col items-center gap-6 mt-4">
                        {!wallet ? (
                            <div className="text-center w-full">
                                <h2 className="text-2xl font-black uppercase mb-4">Connection Required</h2>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-6 leading-relaxed">
                                    Link your wallet to access the simulation <br /> and start earning $DASH.
                                </p>
                                <button 
                                    onClick={connectWallet}
                                    className="w-full bg-primary text-secondary py-5 text-lg font-black uppercase tracking-widest border-4 border-secondary pixel-shadow hover:scale-105 active:translate-y-1 transition-all"
                                >
                                    Connect Wallet
                                </button>
                            </div>
                        ) : (
                            <div className="text-center w-full">
                                <div className="flex items-center justify-center gap-2 text-xs font-black text-green-600 uppercase mb-2">
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    Runner Verified: {wallet.slice(0,6)}...{wallet.slice(-4)}
                                </div>


                                {/* Game Modes */}
                                <div className="grid grid-cols-1 gap-4 mb-8">
                                    <button
                                        onClick={() => payAndPlay(false)}
                                        className="bg-primary text-secondary py-4 px-8 text-xl font-black uppercase tracking-wider border-4 border-secondary pixel-shadow hover:scale-105 transition-all flex items-center justify-center gap-3 active:translate-y-1"
                                    >
                                        <span className="material-symbols-outlined text-3xl">play_arrow</span>
                                        Practice Mode
                                    </button>
                                    
                                    <div className="relative group">
                                        <button
                                            disabled
                                            className="w-full bg-gray-100 text-gray-400 py-4 px-8 text-xl font-black uppercase tracking-wider border-4 border-gray-300 cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            <span className="material-symbols-outlined text-3xl">lock</span>
                                            Ranked Run
                                        </button>
                                        <span className="absolute -top-2 -right-2 bg-gray-200 text-gray-500 text-[8px] px-2 py-1 border-2 border-gray-400 font-black uppercase">Coming Soon</span>
                                    </div>
                                </div>

                                {/* Prize Pool Info */}
                                <div className="bg-accent-gray p-4 border-4 border-secondary mb-8">
                                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                        <span className="text-gray-500">Weekly Pool:</span>
                                        <span className="text-primary">{prizePool} $DASH</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase mt-1">
                                        <span className="material-symbols-outlined text-xs">schedule</span>
                                        Tournament starting soon
                                    </div>
                                </div>

                                {/* Claim Bonus Row */}
                                {!user?.bonusClaimed && (
                                    <div className="flex items-center gap-4 bg-secondary text-primary px-4 py-4 border-4 border-primary pixel-shadow animate-pulse">
                                        <div className="flex-1 text-left">
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Starter Bonus</div>
                                            <div className="text-sm font-black uppercase tracking-tight">5,000 $DASH READY</div>
                                        </div>
                                        <button 
                                            onClick={claimBonus}
                                            className="bg-primary text-secondary px-6 py-2 text-xs font-black uppercase border-2 border-secondary hover:scale-110 transition-transform active:translate-y-1"
                                        >
                                            CLAIM
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Bar */}
                {status && (
                    <div className="mt-8 p-4 bg-primary text-secondary border-4 border-secondary pixel-shadow animate-in slide-in-from-bottom duration-300 flex items-center gap-3">
                        <div className="size-6 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-black uppercase tracking-widest text-xs">{status}</span>
                    </div>
                )}
            </div>

            {/* Decorative Character Footer */}
            <div className="mt-12 flex items-center gap-8 opacity-50 grayscale">
                <div className="w-12 h-12 bg-[url('/player_run_sheet.png')] bg-no-repeat bg-[length:800%_100%] bg-[position:0%_0]"></div>
                <div className="w-12 h-12 bg-[url('/player_run_sheet.png')] bg-no-repeat bg-[length:800%_100%] bg-[position:14%_0]"></div>
                <div className="w-12 h-12 bg-[url('/player_run_sheet.png')] bg-no-repeat bg-[length:800%_100%] bg-[position:28%_0]"></div>
            </div>
        </div>
    );
};

export default GameRoom;
