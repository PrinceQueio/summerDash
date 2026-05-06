import React from 'react';

const AboutPage = ({ onBack, startGame, status }) => {
    return (
        <div className="min-h-screen bg-background-light font-display antialiased text-secondary selection:bg-primary selection:text-secondary">
            {/* Navbar - Simplified */}
            <nav className="sticky top-0 z-50 w-full border-b-4 border-secondary bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
                        <div className="flex size-10 items-center justify-center bg-secondary text-primary rounded-sm pixel-shadow shrink-0">
                            <span className="material-symbols-outlined text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">arrow_back</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight uppercase">Back</h2>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <button
                            onClick={startGame}
                            className="bg-primary text-secondary px-6 py-2 font-bold uppercase tracking-wider text-sm border-2 border-secondary pixel-shadow pixel-shadow-hover transition-all duration-200"
                        >
                            Play
                        </button>
                        {status && <span className="text-[10px] font-black uppercase text-primary bg-secondary px-2 py-0.5 animate-pulse">{status}</span>}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="mx-auto max-w-5xl px-6 py-10 md:py-20 font-black uppercase tracking-tight mb-2">

                {/* Header */}
                <div className="mb-12 md:mb-16 text-center">
                    <div className="inline-block bg-secondary text-primary px-3 py-1 text-[10px] md:text-sm font-bold uppercase mb-4 pixel-shadow font-black uppercase tracking-tight mb-2">
                        Archive File #8821
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase leading-tight md:leading-none mb-6">
                        The World of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600 font-black uppercase tracking-tight mb-2 font-black uppercase tracking-tight mb-2">Summer Dash</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-body">
                        In 21XX, the blockchain is reality.
                    </p>
                </div>

                {/* Lore Section */}
                <section className="mb-16 md:mb-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary translate-x-1 translate-y-1 md:translate-x-2 md:translate-y-2 border-2 border-secondary"></div>
                        <div className="relative bg-white border-2 border-secondary p-6 md:p-8 pixel-shadow">
                            <h3 className="text-xl md:text-2xl font-black uppercase mb-4">The Glitch Protocol</h3>
                            <p className="text-gray-700 font-body leading-relaxed mb-4 text-sm md:text-base">
                                The City is corrupt. A massive "Glitch" is consuming reality.
                            </p>
                            <p className="text-gray-700 font-body leading-relaxed text-sm md:text-base">
                                <strong>Run fast. Validate blocks.</strong>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4 items-start">
                            <span className="material-symbols-outlined text-3xl md:text-4xl text-primary bg-secondary p-2">warning</span>
                            <div>
                                <h4 className="font-bold uppercase text-base md:text-lg">Unstable Sectors</h4>
                                <p className="text-gray-600 text-xs md:text-sm font-black uppercase tracking-tight mb-2">No two runs are identical.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <span className="material-symbols-outlined text-3xl md:text-4xl text-primary bg-secondary p-2">token</span>
                            <div>
                                <h4 className="font-bold uppercase text-base md:text-lg">Proof of Speed</h4>
                                <p className="text-gray-600 text-xs md:text-sm font-black uppercase tracking-tight mb-2">Top players earn AVAX.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Biomes Cards */}
                <section className="mb-16 md:mb-20">
                    <h2 className="text-3xl md:text-4xl font-black uppercase mb-8 md:mb-12 border-b-4 border-secondary pb-2 inline-block font-black uppercase tracking-tight mb-2 font-black uppercase tracking-tight mb-2">
                        Biomes
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 font-black uppercase tracking-tight mb-2">
                        {[
                            { name: 'City Core', desc: 'Starting zone.', icon: 'apartment' },
                            { name: 'Toxic Sewers', desc: 'Avoid the slime.', icon: 'water_drop' },
                            { name: 'Deep Space', desc: 'Zero gravity.', icon: 'rocket_launch' },
                            { name: 'Magma Flats', desc: 'Hardware sector.', icon: 'device_thermostat' },
                            { name: 'Ice Caverns', desc: 'Friction is reduced.', icon: 'ac_unit' },
                            { name: 'Digital Forest', desc: 'Legacy code.', icon: 'forest' }
                        ].map((biome, i) => (
                            <div key={i} className="bg-gray-50 border-2 border-secondary p-4 md:p-6 hover:-translate-y-1 transition-transform cursor-default">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="material-symbols-outlined text-3xl md:text-4xl text-gray-400">{biome.icon}</span>
                                    <span className="font-mono text-[10px] text-gray-500 font-bold font-black uppercase tracking-tight mb-2">0{i + 1}</span>
                                </div>
                                <h3 className="font-bold uppercase text-base md:text-lg mb-2">{biome.name}</h3>
                                <p className="text-xs md:text-sm text-gray-600 font-body">{biome.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Classes */}
                <section>
                    <h2 className="text-3xl md:text-4xl font-black uppercase mb-8 md:mb-12 border-b-4 border-secondary pb-2 inline-block">
                        Runners
                    </h2>
                    <div className="flex flex-col gap-6 md:gap-8">
                        {/* Speedster */}
                        <div className="bg-white border-2 border-secondary p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center pixel-shadow">
                            <div className="size-24 md:size-32 bg-sunny-yellow border-2 border-secondary flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-4xl md:text-6xl font-black uppercase tracking-tight mb-2">directions_run</span>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl md:text-2xl font-black uppercase mb-2">Speedster</h3>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start font-mono text-[10px] md:text-sm">
                                    <span className="bg-secondary text-white px-2 py-1">SPD: High</span>
                                    <span className="bg-gray-200 px-2 py-1">JMP: Double</span>
                                </div>
                            </div>
                        </div>

                        {/* Tank */}
                        <div className="bg-white border-2 border-secondary p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center pixel-shadow">
                            <div className="size-24 md:size-32 bg-sky-blue border-2 border-secondary flex items-center justify-center shrink-0 font-black uppercase tracking-tight mb-2">
                                <span className="material-symbols-outlined text-4xl md:text-6xl font-black uppercase tracking-tight mb-2">shield</span>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl md:text-2xl font-black uppercase mb-2">Tank</h3>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start font-mono text-[10px] md:text-sm">
                                    <span className="bg-gray-200 px-2 py-1">SPD: Med</span>
                                    <span className="bg-secondary text-white px-2 py-1">DEF: High</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
            {/* Footer */}
            <footer className="bg-secondary text-white py-10 px-6 mt-16 text-center">
                <p className="font-mono text-[10px] text-gray-500 font-black uppercase tracking-tight mb-2">End of File.</p>
            </footer>
        </div>
    );
};

export default AboutPage;

