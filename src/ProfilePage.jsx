import React, { useState } from 'react';

const ProfilePage = ({ user, onBack, onUpdateUsername, onDisconnect, onConvertCoins, onJoinTournament, onClaimDaily, rank, status }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState(user?.username || '');

    const [displayLimit, setDisplayLimit] = useState(20);

    const sortedSessions = [...(user.sessions || [])];
    const visibleSessions = sortedSessions.slice(0, displayLimit);

    const getXPData = (totalPoints) => {
        if (totalPoints < 20000) {
            return { level: 0, currentLevelXP: totalPoints, xpForNextLevel: 20000, progress: (totalPoints / 20000) * 100 };
        }
        let level = 1;
        let target = 20000;
        while (totalPoints >= target * 2 && level < 20) {
            target *= 2;
            level++;
        }
        const currentLevelXP = totalPoints - target;
        const xpForNextLevel = target; // target*2 - target = target. The increment to next power.
        const progress = Math.min(100, (currentLevelXP / xpForNextLevel) * 100);
        return { level, currentLevelXP, xpForNextLevel, progress };
    };

    const xpData = getXPData(user.totalPoints);

    const handleUpdate = () => {
        if (newUsername.trim().length < 3) return alert("Username too short!");
        onUpdateUsername(newUsername.trim());
        setIsEditing(false);
    };

    const canClaimDaily = !user.lastDailyClaim || (Math.floor(Date.now() / 1000) >= user.lastDailyClaim + 86400);

    return (
        <div className="min-h-screen bg-background-light font-display antialiased text-secondary selection:bg-primary selection:text-secondary">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b-4 border-secondary bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
                        <div className="flex size-10 items-center justify-center bg-secondary text-primary rounded-sm pixel-shadow shrink-0">
                            <span className="material-symbols-outlined text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">arrow_back</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight uppercase">Dashboard</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-1">Status: Active</p>
                            <p className="text-xs font-mono font-bold leading-none">{user.address.slice(0, 6)}...{user.address.slice(-4)}</p>
                        </div>
                        <button
                            onClick={onDisconnect}
                            className="bg-red-500 text-white border-2 border-secondary px-4 py-2 text-xs font-black uppercase tracking-wider pixel-shadow hover:bg-red-600 active:translate-y-1 transition-all"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-5xl px-6 py-10 md:py-16">

                {/* Profile Header Card */}
                <div className="bg-white border-4 border-secondary p-6 md:p-10 mb-8 pixel-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 -z-0 opacity-5">
                        <span className="material-symbols-outlined text-[200px]">account_circle</span>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className="size-24 md:size-32 bg-primary border-4 border-secondary flex items-center justify-center pixel-shadow">
                                <span className="material-symbols-outlined text-5xl md:text-7xl">face</span>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Runner</p>
                                {isEditing ? (
                                    <div className="flex gap-2 mt-2">
                                        <input
                                            type="text"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            className="bg-gray-100 border-2 border-secondary px-3 py-1 font-bold uppercase w-full"
                                            placeholder="NEW USERNAME"
                                        />
                                        <button onClick={handleUpdate} className="bg-primary border-2 border-secondary px-3 py-1 font-bold">SET</button>
                                        <button onClick={() => setIsEditing(false)} className="bg-gray-200 border-2 border-secondary px-3 py-1 font-bold">X</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl md:text-4xl font-black uppercase">{user.username}</h1>
                                        {!user.usernameChanged && (
                                            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-primary">
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                                {user.usernameChanged && <p className="text-[10px] text-gray-400 mt-1 uppercase">Username finalized</p>}
                            </div>
                        </div>

                        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-primary text-secondary p-6 border-4 border-secondary pixel-shadow-sm text-center">
                                <p className="text-[10px] font-black uppercase mb-1 opacity-70">$DASH Balance</p>
                                <p className="text-xl font-black font-mono">{user.dashBalance?.toLocaleString() || 0}</p>
                                <p className="text-[8px] font-bold uppercase mt-2 opacity-60">*Non-Transferable</p>
                            </div>
                            <div className="bg-accent-gray p-6 border-4 border-secondary pixel-shadow-sm text-center relative overflow-hidden">
                                <p className="text-[10px] font-bold text-secondary uppercase mb-1">Est. Winnings</p>
                                <p className="text-xl font-black font-mono text-primary">0 $DASH</p>
                                <p className="text-[8px] font-bold uppercase mt-2 text-gray-400">Current Rank: --</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Session History */}
                    <div className="md:col-span-2">
                        {/* Tournament Standing Card */}
                        <div className="bg-secondary text-white border-4 border-primary p-6 mb-8 pixel-shadow flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                            {/* Coming Soon Overlay for Tournament */}
                            <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                <p className="text-primary font-black uppercase tracking-widest text-xl rotate-[-2deg] border-4 border-primary px-4 py-2 bg-secondary pixel-shadow">Tournament Coming Soon</p>
                            </div>

                            <div className="flex items-center gap-4 z-20 opacity-30">
                                <div className="size-12 bg-primary flex items-center justify-center text-secondary">
                                    <span className="material-symbols-outlined text-3xl font-black">trophy</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-primary">Tournament Standing</h4>
                                    <p className="text-xs text-gray-400 uppercase">Season #1 Not Started</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">history_edu</span>
                                Run History & Ledger
                            </h3>
                            <span className="text-xs font-bold text-gray-400 uppercase">{user.sessions?.length || 0} Records</span>
                        </div>

                        <div className="bg-white border-4 border-secondary overflow-hidden pixel-shadow">
                            {user.sessions && user.sessions.length > 0 ? (
                                <div className="divide-y-2 divide-gray-100">
                                    <div className="grid grid-cols-5 p-4 bg-gray-50 text-[10px] font-black uppercase text-gray-500">
                                        <div>Date</div>
                                        <div className="text-right">Obstacles</div>
                                        <div className="text-right">Coins</div>
                                        <div className="text-right">Level</div>
                                        <div className="text-right">Status</div>
                                    </div>
                                    {visibleSessions.map((session, i) => (
                                        <div key={i} className="grid grid-cols-5 p-4 items-center hover:bg-primary/5 transition-colors">
                                            <div className="text-xs font-mono font-bold">{new Date(session.date).toLocaleDateString()}</div>
                                            <div className="text-right text-xs font-bold">{session.obstacles || 0}</div>
                                            <div className="text-right text-xs font-black text-primary">+{session.coins || 0}</div>
                                            <div className="text-right text-xs">LVL {session.level}</div>
                                            <div className="text-right">
                                                <span className={`text-[8px] font-black px-2 py-0.5 border ${session.claimed ? 'bg-green-100 text-green-700 border-green-700' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>
                                                    {session.claimed ? 'MINTED' : 'IN WALLET'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {sortedSessions.length > displayLimit && (
                                        <button
                                            onClick={() => setDisplayLimit(prev => prev + 20)}
                                            className="w-full py-4 text-xs font-bold uppercase text-gray-400 hover:text-secondary hover:bg-gray-50 border-t-2 border-gray-100 transition-colors"
                                        >
                                            View More ({sortedSessions.length - displayLimit} hidden)
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="p-10 text-center border-4 border-dashed border-gray-200 m-4">
                                    <span className="material-symbols-outlined text-5xl text-gray-200 mb-2">directions_run</span>
                                    <p className="text-gray-400 font-bold uppercase text-xs">No records found. Start your first run!</p>
                                </div>
                            )}
                        </div>

                        {/* Rank Progress - MOVED HERE */}
                        <div className="mt-12 flex flex-col gap-6">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">military_tech</span>
                                Rank Progress
                            </h3>
                            <div className="bg-white border-4 border-secondary p-6 pixel-shadow relative overflow-hidden group">
                                {/* Coming Soon Overlay */}
                                <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center opacity-100 transition-opacity">
                                    <div className="bg-secondary text-primary border-4 border-primary px-6 py-3 pixel-shadow rotate-[-5deg] font-black uppercase text-xl tracking-tighter">
                                        Coming Soon
                                    </div>
                                </div>

                                <div className="mb-6 opacity-40 grayscale">
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="text-xs font-bold uppercase">To Level {xpData.level + 1}</p>
                                        <p className="text-[10px] font-mono font-bold text-gray-500">{xpData.currentLevelXP.toLocaleString()} / {xpData.xpForNextLevel.toLocaleString()} EXP</p>
                                    </div>
                                    <div className="h-4 bg-gray-100 border-2 border-secondary relative overflow-hidden">
                                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${xpData.progress}%` }}></div>
                                    </div>
                                </div>

                                <div className="space-y-4 opacity-40 grayscale">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase border-b-2 border-gray-100 pb-1">Mastered Biomes</p>
                                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                        {Array.from({ length: 20 }, (_, i) => i + 1).map(i => {
                                            const isMastered = xpData.level >= i;
                                            const isActive = xpData.level === i - 1;

                                            return (
                                                <div key={i} className={`aspect-square flex items-center justify-center border-2 transition-all duration-300 ${isMastered ? 'bg-secondary text-primary border-secondary pixel-shadow-sm' :
                                                    isActive ? 'bg-white text-secondary border-4 border-secondary animate-pulse' :
                                                        'bg-gray-50 text-gray-300 border-dashed border-gray-200'
                                                    }`}>
                                                    <span className="material-symbols-outlined text-sm">
                                                        {isMastered ? 'verified' : isActive ? 'lock_open' : 'lock'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank & Progress */}
                    <div className="flex flex-col gap-6">
                        {/* DAILY SIGN-IN CARD */}
                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">calendar_today</span>
                            Daily Rewards
                        </h3>
                        <div className="bg-white border-4 border-secondary p-6 pixel-shadow relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Sign-In Status</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 border ${canClaimDaily ? 'bg-primary text-secondary border-secondary' : 'bg-green-100 text-green-700 border-green-700'}`}>
                                        {canClaimDaily ? 'READY' : 'CLAIMED'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`size-12 flex items-center justify-center border-4 ${canClaimDaily ? 'bg-primary border-secondary' : 'bg-gray-100 border-gray-300'}`}>
                                        <span className="material-symbols-outlined text-secondary">workspace_premium</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-tight">Daily Streak +500 $DASH</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">One transaction per 24 hours</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={onClaimDaily}
                                    disabled={!canClaimDaily}
                                    className={`w-full py-4 text-sm font-black uppercase tracking-widest border-4 pixel-shadow transition-all flex items-center justify-center gap-2
                                        ${canClaimDaily 
                                            ? 'bg-secondary text-primary border-primary hover:bg-black hover:scale-[1.02] active:translate-y-1' 
                                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'}`}
                                >
                                    <span className="material-symbols-outlined">{canClaimDaily ? 'app_registration' : 'lock_clock'}</span>
                                    {canClaimDaily ? 'Sign-In (Gas Only)' : 'Check Back Tomorrow'}
                                </button>
                                
                                {!canClaimDaily && (
                                    <p className="text-[7px] font-bold text-center text-gray-400 uppercase mt-2">
                                        Next sign-in available in {Math.floor((user.lastDailyClaim + 86400 - Math.floor(Date.now() / 1000)) / 3600)}h {Math.floor(((user.lastDailyClaim + 86400 - Math.floor(Date.now() / 1000)) % 3600) / 60)}m
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* THE SUMMER DASH ATM (BANK) */}
                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">payments</span>
                            $DASH Bank (ATM)
                        </h3>
                        <div className="bg-secondary text-white border-4 border-primary p-6 pixel-shadow relative overflow-hidden group">
                            <div className="absolute -top-4 -right-4 size-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Available Coins</p>
                                    <span className="material-symbols-outlined text-primary animate-pulse">toll</span>
                                </div>
                                
                                <h2 className="text-4xl font-black font-mono text-white mb-2">
                                    {user.gameCoins?.toLocaleString() || 0}
                                </h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-[8px] font-bold uppercase text-gray-400 mb-1">
                                            <span>Progress to 1k Unit</span>
                                            <span>{(user.gameCoins % 1000) || 0} / 1,000</span>
                                        </div>
                                        <div className="h-2 bg-black border border-primary/30 relative overflow-hidden">
                                            <div 
                                                className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_#FFD700]" 
                                                style={{ width: `${Math.min(100, ((user.gameCoins % 1000) / 1000) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={onConvertCoins}
                                        disabled={!user.gameCoins || user.gameCoins < 1000}
                                        className={`w-full py-4 text-sm font-black uppercase tracking-widest border-4 pixel-shadow transition-all flex items-center justify-center gap-2
                                            ${(user.gameCoins >= 1000) 
                                                ? 'bg-primary text-secondary border-white hover:bg-white hover:scale-[1.02] active:translate-y-1' 
                                                : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50'}`}
                                    >
                                        <span className="material-symbols-outlined">account_balance_wallet</span>
                                        {user.gameCoins >= 1000 ? `Exchange for ${Math.floor(user.gameCoins / 1000) * 100} $DASH` : 'Need 1,000 Coins'}
                                    </button>
                                    
                                    <p className="text-[7px] font-bold text-center text-gray-500 uppercase">
                                        Fee: 0.05 AVAX per claim • Instant Mainnet Mint
                                    </p>
                                </div>
                            </div>
                            
                            {/* Status Overlay for Bank */}
                            {status && (
                                <div className="absolute inset-0 bg-secondary/90 backdrop-blur-sm flex items-center justify-center p-4 text-center z-50">
                                    <div className="space-y-3">
                                        <div className="inline-block animate-spin size-6 border-4 border-primary border-t-transparent rounded-full"></div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-tight">{status}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-secondary text-white py-12 px-6 mt-16 text-center">
                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Profile Session Endpoint: {user.address}</p>
                <div className="mt-4 flex justify-center gap-4 text-xs font-bold uppercase text-gray-400">
                    <a href="#" className="hover:text-primary">Help</a>
                    <span>•</span>
                    <a href="#" className="hover:text-primary">Logs</a>
                    <span>•</span>
                    <a href="#" className="hover:text-primary">API</a>
                </div>
            </footer>
        </div>
    );
};

export default ProfilePage;
