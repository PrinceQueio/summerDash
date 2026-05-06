import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAppKitAccount, useAppKit, useAppKitProvider } from '@reown/appkit/react';
import Game from './Game';
import ErrorBoundary from './ErrorBoundary';
import LandingPage from './LandingPage';
import GameContainer from './GameContainer';
import AboutPage from './AboutPage';
import OrientationOverlay from './OrientationOverlay';
import ProfilePage from './ProfilePage';
import { TermsOfService, PrivacyPolicy } from './LegalModals';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const RANKED_FEE_DASH = 1000; 
const INITIAL_DASH = 5000;
const DAILY_REWARD = 500;
const TESTNET_ID = 88882;

const generateRandomUsername = () => {
  const prefixes = ['Runner', 'Glitch', 'Cyber', 'Dash', 'Block', 'Avax', 'Sewer', 'Sky'];
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${suffix}`;
};

const calculateLevelFromXP = (totalPoints) => {
  if (totalPoints < 20000) return 0;
  let level = 1;
  let target = 20000;
  while (totalPoints >= target * 2 && level < 20) {
    target *= 2;
    level++;
  }
  return level;
};

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [gameState, setGameState] = useState('START'); // START, PLAYING, GAMEOVER
  const [currentView, setCurrentView] = useState('LANDING'); // LANDING, ABOUT, PROFILE
  const [score, setScore] = useState(0);
  const [runCoins, setRunCoins] = useState(0);
  const [runObstacles, setRunObstacles] = useState(0);
  const [status, setStatus] = useState('');
  const [prizePool, setPrizePool] = useState('0');
  const [showSubmissionToast, setShowSubmissionToast] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [coinsClaimed, setCoinsClaimed] = useState(false);
  const [hasRevived, setHasRevived] = useState(false);
  const [isRanked, setIsRanked] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // User Statistics & Session State
  const [user, setUser] = useState(null);

  // Reown AppKit Hooks
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { walletProvider } = useAppKitProvider('eip155');

  const wallet = isConnected ? address : null;

  // Load/Save User Profile
  useEffect(() => {
    if (isConnected && address) {
      const savedStats = JSON.parse(localStorage.getItem(`sd_user_${address.toLowerCase()}`));
      if (savedStats) {
        const syncedUser = {
          ...savedStats,
          dashBalance: savedStats.dashBalance ?? 0,
          bonusClaimed: savedStats.bonusClaimed ?? false,
          lastDailyClaim: savedStats.lastDailyClaim ?? 0,
          globalLevel: calculateLevelFromXP(savedStats.totalPoints || 0)
        };
        setUser(syncedUser);
      } else {
        const newUser = {
          address,
          username: generateRandomUsername(),
          usernameChanged: false,
          totalPoints: 0,
          dashBalance: 0, // Starts at 0, must claim
          bonusClaimed: false,
          lastDailyClaim: 0,
          globalLevel: calculateLevelFromXP(0),
          sessions: []
        };
        setUser(newUser);
        localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(newUser));
      }
    } else {
      setUser(null);
    }
  }, [isConnected, address]);

  const updateUsername = (name) => {
    if (!user) return;
    const updatedUser = { ...user, username: name, usernameChanged: true };
    setUser(updatedUser);
    localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
  };

  // Fetch Prize Pool ($DASH)
  const fetchPrizePool = async () => {
    // For MVP/Demo: Mocking pool based on entrants or contract balance
    // In production: This would read from the $DASH contract
    setPrizePool('250000'); // Starting pool example
    if (!walletProvider) return;
    try {
      // Logic to fetch $DASH balance or total pool from contract would go here
      // const dashContract = new ethers.Contract(DASH_TOKEN_ADDRESS, ERC20_ABI, provider);
      // const balance = await dashContract.balanceOf(CONTRACT_ADDRESS);
      // setPrizePool(ethers.formatUnits(balance, 18));
    } catch (err) {
      console.error("Error fetching prize pool:", err);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchPrizePool();
    } else {
      setStatus("");
    }
  }, [isConnected]);

  const connectWallet = async () => {
    try {
      await open();
    } catch (error) {
      console.error("Connection failed:", error);
      setStatus("Connection failed");
    }
  };

  const [gameKey, setGameKey] = useState(0);

  // Manage body scroll based on game state
  useEffect(() => {
    if (gameState === 'PLAYING') {
      document.body.classList.add('game-active');
    } else {
      document.body.classList.remove('game-active');
    }
  }, [gameState]);

  const startGame = () => {
    setScore(0);
    setRunCoins(0);
    setScoreSubmitted(false);
    setCoinsClaimed(false);
    setHasRevived(false); // New run, reset revive
    setGameState('PLAYING');
    setGameKey(prev => prev + 1);
    // Don't clear status here if it was set by payAndPlay, or clear it after a delay
    setTimeout(() => setStatus(""), 2000);
  };

  const claimDailyReward = async () => {
    if (!isConnected || !walletProvider) return;
    
    const now = Math.floor(Date.now() / 1000);
    const lastClaim = user?.lastDailyClaim || 0;
    
    if (now < lastClaim + 86400) {
      const waitTime = Math.ceil((lastClaim + 86400 - now) / 3600);
      return alert(`Reward not ready! Please wait ${waitTime} hours.`);
    }

    try {
      setStatus("Preparing Daily Reward...");
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      const abi = ["function claimDailyReward() public"];
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      setStatus("Claiming 500 $DASH (Pay Gas)...");
      const tx = await contract.claimDailyReward();
      
      setStatus("Awaiting Finality...");
      await tx.wait();

      if (user) {
        const updatedUser = {
          ...user,
          dashBalance: user.dashBalance + DAILY_REWARD,
          lastDailyClaim: now
        };
        setUser(updatedUser);
        localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
        setStatus("Daily Reward Claimed!");
        setTimeout(() => setStatus(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setStatus("Claim Failed");
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const claimBonus = async () => {
    if (!isConnected || !walletProvider) return;
    if (user?.bonusClaimed) return alert("Bonus already claimed!");

    try {
      setStatus("Preparing Bonus Claim...");
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      setStatus("Awaiting Signature (Pay Gas to Claim)...");
      const tx = await signer.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: ethers.parseEther("0") // Gas only
      });

      setStatus("Confirming Claim on Avalanche...");
      await tx.wait();

      if (user) {
        const updatedUser = {
          ...user,
          dashBalance: user.dashBalance + INITIAL_DASH,
          bonusClaimed: true
        };
        setUser(updatedUser);
        localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
        setStatus("5,000 $DASH Claimed Successfully!");
        setTimeout(() => setStatus(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setStatus("Claim Failed: " + (err.reason || err.message));
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const payAndPlay = async (isRankedMode = true) => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      if (isRankedMode) {
        if ((user?.dashBalance || 0) < RANKED_FEE_DASH) {
          return alert(`Insufficient $DASH! You need ${RANKED_FEE_DASH} $DASH to enter.`);
        }
      }

      setStatus(isRankedMode ? `Entering Weekly Tournament (Fee: ${RANKED_FEE_DASH} $DASH)...` : "Authorizing Practice Run (Gas Only)...");
      setIsRanked(isRankedMode);

      // Send transaction to the contract (Gas payment)
      const tx = await signer.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: ethers.parseEther("0") // Gas only transaction
      });

      setStatus("Confirming Entry on Avalanche...");
      
      const receipt = await tx.wait();
      
      if (isRankedMode && user) {
        // Deduct $DASH balance
        const updatedUser = {
          ...user,
          dashBalance: user.dashBalance - RANKED_FEE_DASH
        };
        setUser(updatedUser);
        localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
      }

      setStatus("Race Authorized! Starting...");
      
      // Small delay for UX
      setTimeout(() => {
        fetchPrizePool();
        startGame();
      }, 800);

    } catch (err) {
      console.error(err);
      const errorMessage = err.reason || err.message || "User denied transaction";
      setStatus("Auth Failed: " + (errorMessage.length > 40 ? errorMessage.substring(0, 40) + "..." : errorMessage));
      
      // Reset status after a few seconds
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const [lastLevelReached, setLastLevelReached] = useState(1);
  const handleGameOver = (scoreInfo) => {
    // Receive { score (obstacles), coins } from Game.jsx
    const totalPoints = (scoreInfo.score || 0) + (scoreInfo.coins || 0);

    setScore(totalPoints);
    setRunCoins(scoreInfo.coins || 0);
    setRunObstacles(scoreInfo.score || 0);

    // Simple logic to detect level from score if Game doesn't send it yet
    const estimatedLevel = Math.max(1, Math.floor((scoreInfo.score || 0) / 50) + 1);
    setLastLevelReached(estimatedLevel);
    setGameState('GAMEOVER');
  };

  const convertCoinsToDash = async () => {
    if (!isConnected || !walletProvider) {
      connectWallet();
      return;
    }
    if (runCoins <= 0) return alert("No coins to claim!");

    try {
      setStatus(`Preparing Coin Conversion (${runCoins} Coins)...`);
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      const abi = ["function convertCoinsToDash(uint256 coinAmount) public"];
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      setStatus(`Minting ${runCoins} $DASH on Avalanche...`);
      const tx = await contract.convertCoinsToDash(runCoins);
      
      setStatus("Confirming Transaction...");
      await tx.wait();

      if (user) {
        const updatedUser = {
          ...user,
          dashBalance: user.dashBalance + runCoins
        };
        setUser(updatedUser);
        localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
      }

      setCoinsClaimed(true);
      setStatus("Coins Converted to $DASH!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("Conversion Failed");
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const watchAd = () => {
    if (hasRevived) return alert("You can only revive once per game!");

    setStatus("Loading Ad... 📺");
    // Simulate an ad delay
    setTimeout(() => {
      setStatus("Watching Ad to Revive...");
      setTimeout(() => {
        setStatus("Revived! Continue running!");
        setHasRevived(true);
        setGameState('PLAYING');
        setGameKey(prev => prev + 1);
        setTimeout(() => setStatus(""), 2000);
      }, 5000);
    }, 1000);
  };

  const submitScore = async () => {
    if (!isConnected || !walletProvider) {
      connectWallet();
      return;
    }

    try {
      setStatus("Preparing On-Chain Record...");
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      // Standard ABI for a Scoreboard contract
      const scoreAbi = ["function submitScore(uint256 score) public"];
      const contract = new ethers.Contract(CONTRACT_ADDRESS, scoreAbi, signer);

      setStatus(`Recording Score (${score}) on Avalanche...`);
      
      // We call the submitScore function on the contract
      // This makes the score immutable and verifiable by everyone
      const tx = await contract.submitScore(score);
      
      setStatus("Awaiting Block Finality...");
      await tx.wait();

      setStatus("Score Immutably Recorded!");
      setShowSubmissionToast(true);
      setScoreSubmitted(true);
      setTimeout(() => {
        setShowSubmissionToast(false);
        setStatus("");
      }, 3000);

      if (user) {
        const newSession = {
          date: new Date().toISOString(),
          score: score,
          level: lastLevelReached,
          txHash: tx.hash // Record the transaction proof
        };

        const updatedUser = {
          ...user,
          totalPoints: user.totalPoints + score,
          globalLevel: calculateLevelFromXP(user.totalPoints + score),
          sessions: [...(user.sessions || []), newSession]
        };

        setUser(updatedUser);
        localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.reason || err.message || "User denied submission";
      setStatus("Submission Failed: " + (errorMsg.length > 30 ? errorMsg.substring(0, 30) + "..." : errorMsg));
      setTimeout(() => setStatus(""), 3000);
    }
  };

  // State Switching Logic
  if (gameState === 'START') {
    if (currentView === 'ABOUT') {
      return (
        <>
          <AboutPage
            onBack={() => setCurrentView('LANDING')}
            startGame={() => payAndPlay(false)}
            status={status}
          />
          <TermsOfService isOpen={showTerms} onClose={() => setShowTerms(false)} />
          <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
        </>
      );
    }
    if (currentView === 'PROFILE' && user) {
      return (
        <>
          <ProfilePage
            user={user}
            onBack={() => setCurrentView('LANDING')}
            onUpdateUsername={updateUsername}
            onDisconnect={() => open({ view: 'Account' })}
          />
          <TermsOfService isOpen={showTerms} onClose={() => setShowTerms(false)} />
          <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
        </>
      );
    }
    return (
      <>
        <LandingPage
          startGame={startGame}
          payAndPlay={payAndPlay}
          claimBonus={claimBonus}
          user={user}
          wallet={wallet}
          connectWallet={connectWallet}
          status={status}
          prizePool={prizePool}
          onOpenAbout={() => setCurrentView('ABOUT')}
          onOpenProfile={() => setCurrentView('PROFILE')}
          onOpenTerms={() => setShowTerms(true)}
          onOpenPrivacy={() => setShowPrivacy(true)}
        />
        <TermsOfService isOpen={showTerms} onClose={() => setShowTerms(false)} />
        <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      </>
    );
  }

  // Active Game (PLAYING or GAMEOVER overlay)
  return (
    <OrientationOverlay>
      <div className="relative w-full h-screen bg-black">
        {gameState === 'PLAYING' && (
          <GameContainer
            key={gameKey}
            onGameOver={handleGameOver}
            setScore={setScore}
            initialState={hasRevived ? { score: runObstacles, coins: runCoins, level: lastLevelReached } : null}
            onExit={() => setGameState('START')}
          />
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="flex flex-col gap-4 md:gap-6 text-white items-center text-center p-6 md:p-8 border-4 border-white bg-black shadow-pixel max-w-lg w-full">
              <h1 className="text-4xl md:text-6xl font-black uppercase text-red-600 text-shadow-pixel">GAME OVER</h1>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <div className="flex justify-between w-full border-b border-white/20 pb-1">
                  <span className="text-xs font-bold opacity-70 uppercase tracking-widest">OBSTACLES:</span>
                  <span className="text-xl font-bold">{runObstacles}</span>
                </div>
                <div className="flex justify-between w-full border-b border-white/20 pb-1">
                  <span className="text-xs font-bold opacity-70 uppercase tracking-widest text-primary">COINS:</span>
                  <span className="text-xl font-bold text-primary">{runCoins}</span>
                </div>
                <h2 className="text-2xl md:text-5xl font-black mt-4 uppercase text-white">SCORE: {score}</h2>
              </div>
              <div className="mt-4 md:mt-8 flex flex-wrap gap-3 md:gap-4 justify-center">
                <button onClick={() => payAndPlay(isRanked)} className="border-4 border-white bg-primary px-4 md:px-8 py-2 md:py-4 text-base md:text-xl font-black uppercase text-black shadow-pixel hover:shadow-pixel-hover hover:-translate-y-1 transition-transform active:translate-y-1">
                  Try Again
                </button>
                {!coinsClaimed && runCoins > 0 && (
                  <div className="flex flex-col gap-2">
                    <button onClick={convertCoinsToDash} className="border-4 border-white bg-sunny-yellow px-4 md:px-8 py-2 md:py-4 text-base md:text-xl font-black uppercase text-black shadow-pixel hover:shadow-pixel-hover hover:-translate-y-1 transition-transform active:translate-y-1 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined">payments</span>
                      Claim {runCoins} $DASH
                    </button>
                    {!hasRevived && (
                      <button onClick={watchAd} className="border-4 border-white bg-blue-500 px-4 md:px-8 py-2 md:py-4 text-xs md:text-sm font-black uppercase text-white shadow-pixel hover:shadow-pixel-hover hover:-translate-y-1 transition-transform active:translate-y-1 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">play_circle</span>
                        Watch Ad to Revive & Continue
                      </button>
                    )}
                  </div>
                )}
                {!scoreSubmitted && (
                  <button onClick={submitScore} className="border-4 border-white bg-white px-4 md:px-8 py-2 md:py-4 text-base md:text-xl font-black uppercase text-black shadow-pixel hover:shadow-pixel-hover hover:-translate-y-1 transition-transform active:translate-y-1">
                    {isConnected ? "Submit Score" : "Connect Wallet"}
                  </button>
                )}
                <button onClick={() => setGameState('START')} className="border-4 border-white bg-gray-600 px-4 md:px-8 py-2 md:py-4 text-base md:text-xl font-black uppercase text-white shadow-pixel hover:shadow-pixel-hover hover:-translate-y-1 transition-transform active:translate-y-1">
                  Home
                </button>
              </div>

              {/* Score Submission Toast */}
              {showSubmissionToast && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-500 w-full px-4">
                  <div className="bg-primary border-4 border-white px-8 py-4 shadow-pixel flex items-center gap-4 max-w-sm mx-auto">
                    <span className="material-symbols-outlined text-black text-3xl font-black">verified</span>
                    <p className="text-black font-black uppercase text-xl">Score {score} submitted!</p>
                  </div>
                </div>
              )}

              {status && <div className="mt-4 text-xs md:text-sm font-bold text-yellow-500">{status}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Legal Modals */}
      <TermsOfService isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </OrientationOverlay>
  );
}


export default App;
