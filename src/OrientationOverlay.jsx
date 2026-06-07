import React, { useState, useEffect } from 'react';

const OrientationOverlay = ({ children, active = true }) => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      setIsPortrait(portrait);
      setIsMobile(mobile);
      
      // If user rotates to landscape, we can optionally reset the dismissed state
      if (!portrait) {
        setDismissed(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Only show overlay if it's a mobile device in portrait mode, active is true, and user hasn't dismissed it
  if (active && isMobile && isPortrait && !dismissed) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-secondary text-white p-8 text-center">
        <div className="animate-bounce mb-8">
          <span className="material-symbols-outlined text-8xl text-primary">screen_rotation</span>
        </div>
        <h1 className="text-4xl font-black uppercase mb-4 tracking-tighter">Landscape Mode Required</h1>
        <p className="text-lg text-gray-400 font-body mb-8 max-w-xs">
          For the best racing experience, please rotate your device to landscape mode, or play on a computer.
        </p>
        
        <button 
          onClick={() => setDismissed(true)}
          className="mt-4 px-6 py-3 border-2 border-white bg-gray-800 text-sm font-bold uppercase hover:bg-gray-700 transition-colors"
        >
          My screen won't rotate (Play Anyway)
        </button>
      </div>
    );
  }

  return children;
};

export default OrientationOverlay;
