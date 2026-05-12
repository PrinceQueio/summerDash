/* eslint-disable react/no-unknown-property */
import React, { useState } from 'react';

const LandingPage = ({ startGame, payAndPlay, claimBonus, user, wallet, connectWallet, status, setStatus, prizePool, leaderboard = [], onOpenAbout, onOpenProfile, onOpenShop, onOpenTerms, onOpenPrivacy }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [shopStatus, setShopStatus] = useState('');

    const handlePlayClick = () => {
        if (!wallet) {
            connectWallet();
        } else {
            // For general play click from nav, we default to practice flow
            payAndPlay(false);
        }
    };

    return (
        <div className="bg-background-light text-secondary font-display antialiased overflow-x-hidden min-h-screen">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b-4 border-secondary bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center bg-secondary text-primary rounded-sm pixel-shadow">
                            <span className="material-symbols-outlined text-3xl">videogame_asset</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight uppercase">Summer Dash</h2>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-wide">
                        <button onClick={onOpenAbout} className="hover:text-primary transition-colors uppercase">About Game</button>
                        <a className="hover:text-primary transition-colors" href="#leaderboard">Leaderboard</a>
                        <a className="hover:text-primary transition-colors" href="#avalanche">Avalanche</a>
                        {wallet && (
                            <button onClick={onOpenProfile} className="text-primary bg-secondary px-3 py-1 flex items-center gap-1 pixel-shadow hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-sm">person</span>
                                Profile
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePlayClick}
                            className="hidden sm:flex bg-primary text-secondary px-6 py-2 font-bold uppercase tracking-wider text-sm border-2 border-secondary pixel-shadow pixel-shadow-hover transition-all duration-200"
                        >
                            {wallet ? "Play Now" : "Connect Wallet"}
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-secondary flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-3xl">{isMenuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b-4 border-secondary p-6 flex flex-col gap-6 font-bold uppercase tracking-widest text-sm animate-in slide-in-from-top duration-300">
                        <button onClick={() => { onOpenAbout(); setIsMenuOpen(false); }} className="text-left py-2 border-b border-gray-100 uppercase">About Game</button>
                        <a onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-gray-100" href="#leaderboard">Leaderboard</a>
                        <a onClick={() => setIsMenuOpen(false)} className="py-2 border-b border-gray-100" href="#avalanche">Avalanche</a>
                        {wallet && (
                            <button onClick={() => { onOpenProfile(); setIsMenuOpen(false); }} className="text-left py-2 border-b border-gray-100 text-primary uppercase">Profile</button>
                        )}
                        <button
                            onClick={() => { handlePlayClick(); setIsMenuOpen(false); }}
                            className="bg-primary text-secondary w-full py-4 font-bold uppercase tracking-wider text-base border-2 border-secondary pixel-shadow"
                        >
                            {wallet ? "Play Now" : "Connect Wallet"}
                        </button>
                    </div>
                )}
            </nav>

            {/* Main Layout with Pathway */}
            <div className="relative mx-auto max-w-7xl flex flex-col md:flex-row">
                {/* The Pathway (Left Sidebar decorative on desktop) */}
                <div className="hidden md:flex w-24 flex-col items-center pt-10 shrink-0 relative">
                    <div className="sticky top-32 flex flex-col items-center h-[calc(100vh-8rem)]">
                        <div className="size-4 bg-primary rounded-full mb-2 animate-pulse"></div>
                        <div className="w-1 h-full pathway-dashed opacity-50"></div>
                        <div className="size-4 border-2 border-primary bg-white rounded-full mt-2"></div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    {/* Hero Section */}
                    <section className="relative px-6 py-12 md:py-24 lg:py-32 overflow-hidden">
                        <div className="absolute top-0 right-0 -z-10 w-full h-full opacity-10 bg-pixel-pattern"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="flex flex-col gap-6 z-10">
                                <div className="inline-flex items-center gap-2 bg-secondary text-primary px-3 py-1 text-xs font-bold uppercase w-fit transform -rotate-2 pixel-shadow">
                                    <span className="material-symbols-outlined text-sm">bolt</span>
                                    <span>Live on Avalanche</span>
                                </div>
                                {/* Dynamic Hero Headline with Pushing Character */}
                                <div className="relative group mb-8 pt-4">
                                    {/* The Pushing Character (Static Power Pose - Right Side) */}
                                    <div className="absolute -right-12 md:-right-20 top-1/2 -translate-y-1/2 w-16 h-16 md:w-24 md:h-24 z-10 pointer-events-none transform rotate-[-15deg] scale-x-[-1]">
                                        <div className="w-full h-full bg-[url('/player_run_sheet.png')] bg-no-repeat bg-[length:800%_100%] bg-[position:0%_0] drop-shadow-[-4px_0px_0px_rgba(0,255,150,0.5)]"></div>
                                    </div>

                                    <h1 className="relative text-4xl sm:text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase pr-4 md:pr-8 border-r-8 border-primary select-none text-right">
                                        <span className="block hover:-translate-x-2 transition-transform duration-300">Escape the</span>
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600 block animate-glitch-text">Glitch.</span>
                                        <span className="block hover:-translate-x-1 transition-transform duration-300">Run Forever.</span>
                                    </h1>

                                    {/* Decorative "Force" lines to emphasize the push from right */}
                                    <div className="absolute right-0 top-0 h-full w-2 bg-gradient-to-b from-transparent via-primary/30 to-transparent animate-pulse"></div>
                                </div>

                                <div className="bg-primary text-secondary px-4 py-2 border-2 border-secondary pixel-shadow transform rotate-1 w-fit mb-4 ml-auto">
                                    <span className="text-sm font-black uppercase tracking-widest">Connect Wallet & Claim 5,000 $DASH Bonus!</span>
                                </div>
                                {wallet && !user?.bonusClaimed && (
                                    <div className="flex items-center gap-4 mb-6 ml-auto w-fit bg-secondary/5 px-4 py-3 border-l-4 border-primary">
                                        <span className="text-xs font-black uppercase text-gray-600 tracking-wider">
                                            5,000 $DASH Bonus (Pay Gas)
                                        </span>
                                        <button
                                            onClick={claimBonus}
                                            className="bg-primary text-secondary px-5 py-1.5 text-xs font-black uppercase border-2 border-secondary pixel-shadow-sm hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer"
                                        >
                                            Claim
                                        </button>
                                    </div>
                                )}
                                {wallet && user?.bonusClaimed && (
                                    <div className="flex items-center gap-2 mb-6 text-green-600 font-black uppercase text-xs">
                                        <span className="material-symbols-outlined">verified</span>
                                        Starter Bonus Claimed
                                    </div>
                                )}
                                <p className="text-base md:text-lg text-gray-600 font-medium max-w-md font-body leading-relaxed">
                                    Navigate through <strong>7 Glitched Biomes</strong> ranging from Cyber-Sewers to Deep Space.
                                    The weekly prize pool grows by <strong>1,000 $DASH</strong> per runner.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-end">
                                    <button
                                        onClick={() => payAndPlay(false)}
                                        className="bg-primary text-secondary h-14 px-8 text-lg font-bold uppercase tracking-wider border-2 border-secondary pixel-shadow pixel-shadow-hover transition-all duration-200 flex items-center justify-center gap-2 active:translate-y-1"
                                    >
                                        <span className="material-symbols-outlined">play_arrow</span>
                                        Practice
                                    </button>
                                    <button
                                        disabled
                                        className="bg-gray-100 text-gray-400 h-14 px-8 text-lg font-bold uppercase tracking-wider border-2 border-gray-300 transition-all duration-200 flex items-center justify-center gap-2 cursor-not-allowed group relative"
                                    >
                                        <span className="material-symbols-outlined">lock</span>
                                        Ranked
                                        <span className="absolute -top-3 -right-3 bg-gray-200 text-gray-500 text-[8px] px-2 py-1 border-2 border-gray-400 font-black uppercase">Coming Soon</span>
                                    </button>
                                </div>
                                {status && (
                                    <div className="mt-4 p-4 bg-secondary text-primary border-4 border-primary pixel-shadow animate-in fade-in slide-in-from-left duration-300 flex items-center gap-3">
                                        <div className="size-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <span className="font-black uppercase tracking-widest text-xs md:text-sm">{status}</span>
                                    </div>
                                )}
                                <div className="text-[10px] md:text-xs font-bold uppercase text-gray-400 tracking-widest mt-4 flex items-center gap-4">
                                    <div>Current Pool: <span className="text-primary font-black uppercase">{prizePool} $DASH</span></div>
                                    <div className="flex items-center gap-1 text-secondary">
                                        <span className="material-symbols-outlined text-xs">schedule</span>
                                        <span>Tournament Not Started</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative h-[250px] sm:h-[350px] md:h-[400px] w-full bg-accent-gray border-4 border-secondary pixel-shadow group">
                                {/* Decorative abstract game scene */}
                                <div className="absolute inset-0 bg-cover bg-center" data-alt="Abstract pixel art city skyline" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA6KQiIbyroJB168YG_dn97nHeBMN15KxSPtsMSR0MF4tVV9Fb9lqBZX2nSUImtGZEiXUAGjx8MI62asWkMIEHVt6XbpD89UK9OJICDuJl9f0wy5EMg5yCD-GeZchZX2Ul7tI-8M-dwYM7tayamE0tRZmgoYbOaaDR5voQIMevcnV8XTd4io27mVtLeyk2MVUmadeW8fh908m-Cdg5c4ju6fIELgFVd4XBJRm9FMv6f4kT7NV1ROVnRVyeFx8xdb2827xXAVV5XQxna")', imageRendering: 'pixelated' }}>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent flex items-end p-4 md:p-6">
                                    <div className="bg-white p-3 md:p-4 border-2 border-secondary w-full">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] md:text-xs font-bold uppercase text-gray-500">Current Runner</span>
                                            <span className="text-[10px] md:text-xs font-bold text-primary bg-secondary px-2 py-0.5">LVL 99</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-3/4"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How to Earn Section */}
                    <section className="px-6 py-16 bg-accent-gray border-y-4 border-secondary">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-5xl font-black uppercase mb-4 tracking-tighter text-secondary">How to Earn $DASH</h2>
                                <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Start your journey to the Top 10</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Path 1 */}
                                <div className="bg-white border-4 border-secondary p-8 pixel-shadow flex flex-col items-center text-center group hover:-translate-y-2 transition-transform">
                                    <div className="size-16 bg-primary border-4 border-secondary flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                                        <span className="material-symbols-outlined text-4xl text-secondary font-black uppercase tracking-tight mb-2">card_giftcard</span>
                                    </div>
                                    <h3 className="text-xl font-black uppercase mb-3 text-secondary">1. Claim Bonus</h3>
                                    <p className="text-xs font-bold text-gray-500 uppercase leading-relaxed mb-4">
                                        Connect your wallet and pay a small network fee to mint your <strong>5,000 $DASH</strong> starter pack.
                                    </p>
                                    <div className="mt-auto text-[10px] font-black text-primary uppercase">+5,000 $DASH ONCE</div>
                                </div>

                                {/* Path 2 */}
                                <div className="bg-white border-4 border-secondary p-8 pixel-shadow flex flex-col items-center text-center group hover:-translate-y-2 transition-transform">
                                    <div className="size-16 bg-secondary border-4 border-primary flex items-center justify-center mb-6 group-hover:-rotate-6 transition-transform text-primary">
                                        <span className="material-symbols-outlined text-4xl font-black uppercase tracking-tight mb-2">payments</span>
                                    </div>
                                    <h3 className="text-xl font-black uppercase mb-3 text-secondary">2. Grind Practice</h3>
                                    <p className="text-xs font-bold text-gray-500 uppercase leading-relaxed mb-4">
                                        Run in Practice Mode, collect coins, and convert them to <strong>$DASH</strong> by paying gas. No entry fee required!
                                    </p>
                                    <div className="mt-auto text-[10px] font-black text-secondary uppercase">UNLIMITED EARNINGS</div>
                                </div>

                                {/* Path 3 */}
                                <div className="bg-white border-4 border-secondary p-8 pixel-shadow flex flex-col items-center text-center group hover:-translate-y-2 transition-transform">
                                    <div className="size-16 bg-yellow-400 border-4 border-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-4xl text-secondary font-black uppercase tracking-tight mb-2">workspace_premium</span>
                                    </div>
                                    <h3 className="text-xl font-black uppercase mb-3 text-secondary">3. Win Tournament</h3>
                                    <p className="text-xs font-bold text-gray-500 uppercase leading-relaxed mb-4">
                                        Enter the Ranked Tournament for 1,000 $DASH and compete for the <strong>Top 10</strong> spots to share the weekly pool.
                                    </p>
                                    <div className="mt-auto text-[10px] font-black text-yellow-600 uppercase">WIN UP TO 40% OF POOL</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* About The Game Section */}
                    <section className="px-6 py-16 md:py-20 bg-secondary text-white border-b-4 border-primary">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="flex flex-col gap-6">
                                <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm">
                                    <span className="w-8 h-0.5 bg-primary"></span>
                                    System Overview
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black uppercase leading-none">
                                    Survive The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600">Infinite Run</span>
                                </h2>
                                <p className="text-gray-300 font-body text-base md:text-lg leading-relaxed">
                                    <strong>Summer Dash</strong> is a high-octane runner where speed is your survival.
                                </p>
                                <ul className="space-y-4 font-body">
                                    <li className="flex items-start gap-4">
                                        <div className="size-8 bg-primary text-secondary flex items-center justify-center font-bold shrink-0 pixel-shadow">1</div>
                                        <div>
                                            <h4 className="font-bold uppercase text-primary text-sm md:text-base">Dodge & Weave</h4>
                                            <p className="text-gray-400 text-xs md:text-sm">Jump over spikes and glitch-barriers.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="size-8 bg-primary text-secondary flex items-center justify-center font-bold shrink-0 pixel-shadow">2</div>
                                        <div>
                                            <h4 className="font-bold uppercase text-primary text-sm md:text-base">Evolve</h4>
                                            <p className="text-gray-400 text-xs md:text-sm">Survive to shift through 7 biomes.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="size-8 bg-primary text-secondary flex items-center justify-center font-bold shrink-0 pixel-shadow">3</div>
                                        <div>
                                            <h4 className="font-bold uppercase text-primary text-sm md:text-base">Win AVAX</h4>
                                            <p className="text-gray-400 text-xs md:text-sm">Claim your share of the prize pool.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="relative">
                                {/* Visual Representation of Gameplay */}
                                <div className="aspect-video bg-black border-4 border-white pixel-shadow p-2 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[url('/classic_bg.png')] bg-cover opacity-50"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-2 animate-pulse">
                                            <span className="material-symbols-outlined text-4xl md:text-6xl text-primary">videogame_asset</span>
                                            <span className="font-black uppercase text-white tracking-widest text-xs md:text-sm">Gameplay Preview</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 left-2 text-[8px] md:text-xs font-mono text-white">SCORE: 004210</div>
                                    <div className="absolute top-2 right-2 text-[8px] md:text-xs font-mono text-white">LVL 03</div>
                                </div>
                                {/* Keyboard/Touch Hints */}
                                <div className="flex flex-wrap gap-4 mt-6 justify-center">
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                                        <span className="border border-gray-600 px-2 py-1 rounded bg-black text-white">SPACE / TAP</span>
                                        <span>to JUMP</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                                        <span className="border border-gray-600 px-2 py-1 rounded bg-black text-white">HOLD</span>
                                        <span>for HIGHER</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="px-6 py-16 md:py-20 bg-white relative" id="features">
                        <div className="flex flex-col gap-12">
                            <div className="flex flex-col gap-4 max-w-2xl text-center md:text-left">
                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">The Simulation</h2>
                                <p className="text-gray-600 font-body text-base md:text-lg">
                                    The world is crumbling. Only the fastest survive.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Card 1 */}
                                <div className="group bg-sunny-yellow border-2 border-secondary p-6 hover:bg-white transition-colors duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <span className="material-symbols-outlined text-6xl md:text-8xl font-black uppercase tracking-tight mb-2">directions_run</span>
                                    </div>
                                    <div className="size-12 bg-white flex items-center justify-center border-2 border-secondary mb-4 pixel-shadow">
                                        <span className="material-symbols-outlined text-secondary">sprint</span>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold uppercase mb-2">Speedster</h3>
                                    <p className="text-black/80 font-body text-xs md:text-sm">Agile. Built for high-stakes sprinting.</p>
                                </div>
                                {/* Card 2 */}
                                <div className="group bg-sky-blue border-2 border-secondary p-6 hover:bg-white transition-colors duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <span className="material-symbols-outlined text-6xl md:text-8xl font-black uppercase tracking-tight mb-2">landscape</span>
                                    </div>
                                    <div className="size-12 bg-white flex items-center justify-center border-2 border-secondary mb-4 pixel-shadow">
                                        <span className="material-symbols-outlined text-secondary">public</span>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold uppercase mb-2">7 Biomes</h3>
                                    <p className="text-black/80 font-body text-xs md:text-sm">Sewers, Deep Space, Ice Caverns.</p>
                                </div>
                                {/* Card 3 */}
                                <div className="group bg-grass-green border-2 border-secondary p-6 hover:bg-white transition-colors duration-300 relative overflow-hidden sm:col-span-2 lg:col-span-1">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <span className="material-symbols-outlined text-6xl md:text-8xl font-black uppercase tracking-tight mb-2">bolt</span>
                                    </div>
                                    <div className="size-12 bg-white flex items-center justify-center border-2 border-secondary mb-4 pixel-shadow">
                                        <span className="material-symbols-outlined text-secondary">offline_bolt</span>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold uppercase mb-2 font-black uppercase tracking-tight mb-2">Boosts</h3>
                                    <p className="text-black/80 font-body text-xs md:text-sm">Trigger temporary invincibility.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Avalanche Integration */}
                    <section className="px-6 py-16 md:py-20 bg-secondary text-white relative overflow-hidden" id="avalanche">
                        <div className="absolute top-10 right-10 size-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
                            <div className="order-2 lg:order-1 relative">
                                <div className="relative z-10 bg-white text-secondary p-4 border-4 border-primary pixel-shadow transform rotate-2 max-w-xs mx-auto">
                                    <div className="aspect-square bg-white mb-4 border-2 border-gray-100 flex items-center justify-center overflow-hidden">
                                        <img 
                                            src="/summerdash_branded_hoodie_mockup_1778342413693.png" 
                                            alt="SummerDash Branded Hoodie" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-xs md:text-sm font-black uppercase tracking-tight mb-2">
                                        <span className="font-bold uppercase">SummerDash #01</span>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2 flex flex-col gap-6">
                                <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm">
                                    <span className="w-8 h-0.5 bg-primary"></span>
                                    Avalanche
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black uppercase leading-[1.1]">
                                    Skill.<br />
                                    <span className="text-primary font-black uppercase tracking-tight mb-2">On-Chain.</span>
                                </h2>
                                <p className="text-gray-300 font-body text-base md:text-lg leading-relaxed">
                                    Transparent Fairness. Instant Rewards.
                                </p>
                                <button
                                        onClick={(e) => {
                                            const btn = e.currentTarget;
                                            btn.innerText = "COMING SOON";
                                            btn.disabled = true;
                                            btn.classList.add('opacity-50', 'cursor-not-allowed');
                                        }}
                                        className="mt-2 bg-primary text-secondary px-4 py-2 text-sm font-black uppercase tracking-widest border-2 border-white pixel-shadow hover:scale-105 transition-all active:translate-y-1 w-fit"
                                    >
                                        Visit Shop
                                    </button>
                            </div>
                        </div>
                    </section>

                    {/* Leaderboard Section */}
                    <section className="px-6 py-16 md:py-24 bg-white" id="leaderboard">
                        <div className="max-w-4xl mx-auto flex flex-col items-center">
                            <h2 className="text-3xl md:text-4xl font-black uppercase mb-4 text-center bg-secondary text-white px-8 py-2 inline-block transform -skew-x-12">
                                <span className="transform skew-x-12 inline-block font-black uppercase tracking-tight mb-2">Leaderboard</span>
                            </h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Weekly Tournament Payouts</p>

                            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                {/* Distribution Breakdown */}
                                <div className="border-4 border-secondary p-6 bg-accent-gray pixel-shadow">
                                    <h3 className="text-sm font-black uppercase mb-4 text-secondary flex items-center gap-2">
                                        <span className="material-symbols-outlined">payments</span>
                                        Prize Distribution
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold border-b border-secondary/10 pb-1">
                                            <span>Rank 1</span>
                                            <span className="text-black font-black">40% ({Math.floor(prizePool * 0.4).toLocaleString()} $DASH)</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold border-b border-secondary/10 pb-1">
                                            <span>Rank 2</span>
                                            <span className="text-black font-black">20% ({Math.floor(prizePool * 0.2).toLocaleString()} $DASH)</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold border-b border-secondary/10 pb-1">
                                            <span>Rank 3</span>
                                            <span className="text-black font-black">10% ({Math.floor(prizePool * 0.1).toLocaleString()} $DASH)</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold border-b border-secondary/10 pb-1">
                                            <span>Rank 4-10</span>
                                            <span className="text-black font-black">2% ea. ({Math.floor(prizePool * 0.02).toLocaleString()} $DASH)</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold pt-1 opacity-50">
                                            <span>Team Pool</span>
                                            <span>16% ({Math.floor(prizePool * 0.16).toLocaleString()} $DASH)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Runners Counter */}
                                <div className="border-4 border-secondary p-6 bg-white pixel-shadow flex flex-col justify-center items-center text-center">
                                    <div className="text-4xl font-black text-secondary mb-1">0</div>
                                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Active Runners This Week</div>
                                    <div className="mt-4 text-[10px] font-bold text-black uppercase">Tournament Starting Soon (+1,000 $DASH Entry)</div>
                                </div>
                            </div>

                            <div className="w-full border-4 border-secondary bg-white pixel-shadow overflow-x-auto">
                                <div className="min-w-[500px]">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-12 gap-4 p-4 bg-secondary text-white border-b-4 border-secondary font-bold uppercase text-xs md:text-sm tracking-wider">
                                        <div className="col-span-2 text-center">Rank</div>
                                        <div className="col-span-6 font-black uppercase tracking-tight mb-2">Runner</div>
                                        <div className="col-span-4 text-right">Score</div>
                                    </div>
                                    {leaderboard.length > 0 ? (
                                        leaderboard.map((entry, index) => (
                                            <div key={entry.address} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 items-center hover:bg-primary/10 transition-colors">
                                                <div className="col-span-2 text-center flex justify-center">
                                                    <div className={`size-8 border-2 border-black flex items-center justify-center font-bold text-black ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : index === 2 ? 'bg-orange-400' : 'bg-white'}`}>
                                                        {index + 1}
                                                    </div>
                                                </div>
                                                <div className="col-span-6 flex items-center gap-3">
                                                    <span className="font-bold font-body text-sm md:text-base text-secondary">
                                                        {entry.username}
                                                        {entry.address.toLowerCase() === wallet?.toLowerCase() && (
                                                            <span className="ml-2 text-[8px] bg-primary px-1 py-0.5 rounded-full text-secondary">YOU</span>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="col-span-4 text-right font-mono font-bold text-base md:text-lg text-secondary">
                                                    {entry.score.toLocaleString()}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                                            No records yet. Be the first to run!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Footer */}
                    <section className="px-6 py-16 md:py-20 bg-accent-gray border-t-4 border-secondary">
                        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
                            <h2 className="text-3xl md:text-5xl font-black uppercase max-w-2xl leading-tight font-black uppercase tracking-tight mb-2">
                                Enter the simulation.
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <button
                                    onClick={() => payAndPlay(false)}
                                    className="bg-secondary text-primary h-14 px-8 text-lg font-bold uppercase tracking-wider border-2 border-secondary pixel-shadow hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-3 active:translate-y-1"
                                >
                                    <span className="material-symbols-outlined">play_arrow</span>
                                    Practice
                                </button>
                                 <button
                                    disabled
                                    className="bg-gray-100 text-gray-400 h-14 px-8 text-lg font-bold uppercase tracking-wider border-2 border-gray-300 cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    <span className="material-symbols-outlined">lock</span>
                                    Ranked
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Balance Spacer (Desktop Only) - Ensures content center matches viewport center */}
                <div className="hidden md:flex w-24 shrink-0 pointer-events-none"></div>
            </div>
            {/* Footer - Minimalist Version from Mockup */}
            <footer className="bg-[#111] text-white pt-10 pb-2 border-t border-white/5 relative">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-2xl">sports_esports</span>
                        <span className="text-lg font-black uppercase tracking-widest">Summer Dash</span>
                    </div>

                    {/* Center Links */}
                    <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-400">
                        <button onClick={onOpenPrivacy} className="hover:text-white transition-colors">Privacy</button>
                        <button onClick={onOpenTerms} className="hover:text-white transition-colors">TERMS</button>
                        <button className="hover:text-white transition-colors opacity-50 cursor-not-allowed">SUPPORT</button>
                    </div>

                    {/* Right Attribution */}
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                        POWERED BY <span className="text-gray-300">AVALANCHE</span>
                    </div>
                </div>

                {/* Bottom Bright Green Bar */}
                <div className="h-2 w-full bg-primary"></div>
            </footer>
        </div>
    );
};

export default LandingPage;

