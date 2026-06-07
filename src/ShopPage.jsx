import React from 'react';

const ShopPage = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-secondary text-white font-display flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-pixel-pattern pointer-events-none"></div>
        <div className="absolute -top-24 -left-24 size-64 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 size-64 bg-primary/20 rounded-full blur-3xl"></div>
        
        <div className="absolute top-8 left-8 z-20">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
            >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Hub
            </button>
        </div>

        <div className="text-center z-10 bg-white/5 backdrop-blur-sm p-12 border-4 border-primary pixel-shadow">
            <span className="material-symbols-outlined text-6xl text-primary mb-4 animate-pulse">storefront</span>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                Shop <span className="text-primary">Coming Soon</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm max-w-md mx-auto leading-relaxed">
                We're stocking up the shelves with exclusive Summer Dash gear. Check back soon.
            </p>
        </div>
    </div>
  );
};

export default ShopPage;
