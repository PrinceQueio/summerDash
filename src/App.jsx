// VERSION: 1.0.4 - FIXED ESTIMATED_LEVEL BUG
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAppKitAccount, useAppKit, useAppKitProvider, useAppKitNetwork } from '@reown/appkit/react';
import { avalanche } from '@reown/appkit/networks';
import Game from './Game';
import ErrorBoundary from './ErrorBoundary';
import LandingPage from './LandingPage';
import GameContainer from './GameContainer';
import AboutPage from './AboutPage';
import OrientationOverlay from './OrientationOverlay';
import ProfilePage from './ProfilePage';
import ShopPage from './ShopPage';
import { TermsOfService, PrivacyPolicy } from './LegalModals';
import { supabase } from './lib/supabase'; // NEW: Global Identity

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const RANKED_FEE_DASH = 1000; 
const INITIAL_DASH = 5000;
const DAILY_REWARD = 500;
const CHAIN_ID = 43114; // Avalanche C-Chain Mainnet

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
  const { caipNetwork, switchNetwork } = useAppKitNetwork();

  const wallet = isConnected ? address : null;

  // Load/Save User Profile (Cloud Synced)
  useEffect(() => {
    if (isConnected && address) {
      const syncCloudProfile = async () => {
        try {
          const { data: cloudProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('address', address.toLowerCase())
            .single();

          const localKey = `sd_user_${address.toLowerCase()}`;
          const savedStats = JSON.parse(localStorage.getItem(localKey)) || {};

          if (cloudProfile) {
            // Cloud has the identity
            const syncedUser = {
              ...savedStats,
              address,
              username: cloudProfile.username,
              usernameChanged: true,
              totalPoints: savedStats.totalPoints || 0,
              dashBalance: savedStats.dashBalance || 0,
              gameCoins: savedStats.gameCoins || 0,
              globalLevel: calculateLevelFromXP(savedStats.totalPoints || 0),
              sessions: savedStats.sessions || []
            };
            setUser(syncedUser);
            localStorage.setItem(localKey, JSON.stringify(syncedUser));
          } else if (Object.keys(savedStats).length > 0) {
            // Local exists, sync to cloud
            setUser(savedStats);
            await supabase.from('profiles').upsert({ 
              address: address.toLowerCase(), 
              username: savedStats.username,
              game_coins: savedStats.gameCoins || 0 
            });
          } else {
            // Brand new player
            const newUser = {
              address,
              username: generateRandomUsername(),
              usernameChanged: false,
              totalPoints: 0,
              dashBalance: 0,
              gameCoins: 0,
              bonusClaimed: false,
              lastDailyClaim: 0,
              globalLevel: calculateLevelFromXP(0),
              sessions: []
            };
            setUser(newUser);
            localStorage.setItem(localKey, JSON.stringify(newUser));
            await supabase.from('profiles').insert({ 
              address: address.toLowerCase(), 
              username: newUser.username 
            });
          }
        } catch (err) {
          console.error("Cloud Sync Error:", err);
        }
      };
      syncCloudProfile();
    } else {
      setUser(null);
    }
  }, [isConnected, address]);

  const updateUsername = async (name) => {
    if (!user) return;
    const updatedUser = { ...user, username: name, usernameChanged: true };
    setUser(updatedUser);
    localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
    
    // Sync to Cloud
    await supabase
      .from('profiles')
      .upsert({ 
        address: address.toLowerCase(), 
        username: name,
        game_coins: user.gameCoins || 0 
      });
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

  const [leaderboard, setLeaderboard] = useState([]);

  // Fetch Leaderboard from Supabase
  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setLeaderboard(data || []);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchPrizePool();
      fetchLeaderboard();
    } else {
      setStatus("");
    }
  }, [isConnected]);

  // Automatic Network Switching logic
  useEffect(() => {
    if (isConnected && caipNetwork && Number(caipNetwork.id) !== CHAIN_ID) {
      const triggerSwitch = async () => {
        try {
          console.log(`Wrong network detected (${caipNetwork.id}). Switching to Avalanche (${CHAIN_ID})...`);
          await switchNetwork(avalanche);
        } catch (err) {
          console.error("Failed to switch network:", err);
        }
      };
      triggerSwitch();
    }
  }, [isConnected, caipNetwork, switchNetwork]);

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
    
    // Ensure correct network
    if (caipNetwork && Number(caipNetwork.id) !== CHAIN_ID) {
      await switchNetwork(avalanche);
      return;
    }

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

    // Ensure correct network
    if (caipNetwork && Number(caipNetwork.id) !== CHAIN_ID) {
      await switchNetwork(avalanche);
      return;
    }

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

    // Ensure correct network
    if (caipNetwork && Number(caipNetwork.id) !== CHAIN_ID) {
      await switchNetwork(avalanche);
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

      setStatus(isRankedMode ? `Entering Weekly Tournament (Fee: ${RANKED_FEE_DASH} $DASH)...` : "Starting Practice Run...");
      setIsRanked(isRankedMode);

      if (isRankedMode) {
        // Send transaction to the contract (Gas payment)
        const tx = await signer.sendTransaction({
          to: CONTRACT_ADDRESS,
          value: ethers.parseEther("0") // Gas only transaction
        });

        setStatus("Confirming Entry on Avalanche...");
        await tx.wait();

        if (user) {
          // Deduct $DASH balance
          const updatedUser = {
            ...user,
            dashBalance: user.dashBalance - RANKED_FEE_DASH
          };
          setUser(updatedUser);
          localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
        }
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
  const onRunComplete = async (scoreInfo) => {
    // Receive { score (obstacles), coins } from Game.jsx
    const totalPoints = (scoreInfo.score || 0) + (scoreInfo.coins || 0);

    setScore(totalPoints);
    setRunCoins(scoreInfo.coins || 0);
    setRunObstacles(scoreInfo.score || 0);

    // Simple logic to detect level from score if Game doesn't send it yet
    setLastLevelReached(scoreInfo.level || 1);
    setGameState('GAMEOVER');

    // NEW: Save practice coins and session history to local & cloud
    if (user) {
      const newSession = {
        date: new Date().toISOString(),
        points: totalPoints,
        obstacles: scoreInfo.score || 0,
        coins: scoreInfo.coins || 0,
        level: scoreInfo.level || 1
      };

      const updatedUser = {
        ...user,
        gameCoins: (user.gameCoins || 0) + (scoreInfo.coins || 0),
        totalPoints: (user.totalPoints || 0) + totalPoints,
        sessions: [newSession, ...(user.sessions || [])].slice(0, 50), // Keep last 50
        lastValidation: scoreInfo.validation
      };

      setUser(updatedUser);
      localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
      
      // NEW: Immediate Cloud Sync of Coins & Best Score
      await supabase.from('profiles').upsert({
        address: address.toLowerCase(),
        game_coins: updatedUser.gameCoins,
        total_points: updatedUser.totalPoints,
        last_run_score: scoreInfo.score
      }, { onConflict: 'address' });
    }
  };

  const convertCoinsToDash = async () => {
    if (!isConnected || !walletProvider) {
      connectWallet();
      return;
    }
    
    // Ensure correct network
    if (caipNetwork && Number(caipNetwork.id) !== CHAIN_ID) {
      await switchNetwork(avalanche);
      return;
    }

    const availableCoins = user?.gameCoins || 0;
    if (availableCoins < 1000) return alert("You need at least 1,000 Coins to convert!");

    try {
      setStatus(`Preparing Coin Conversion (${availableCoins} Coins)...`);
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      setStatus(`Fetching Secure Signature...`);
      const runId = ethers.id(`run_${Date.now()}_${address}`); // Generate unique Run ID

      const response = await fetch('/api/sign-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerAddress: address,
          gameCoins: availableCoins,
          runId: runId,
          contractAddress: CONTRACT_ADDRESS,
          chainId: CHAIN_ID
        })
      });

      const { signature, error } = await response.json();
      if (error) throw new Error(error);

      // Updated ABI for the new contract function
      const abi = ["function convertPracticeCoins(uint256 _gameCoins, bytes32 _runId, bytes memory _signature) public payable"];
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      setStatus(`Claiming Dash (Fee: 0.05 AVAX)...`);
      // 0.05 AVAX fee as requested
      const tx = await contract.convertPracticeCoins(availableCoins, runId, signature, {
        value: ethers.parseEther("0.05")
      });
      
      setStatus("Awaiting Finality on Avalanche...");
      await tx.wait();

      if (user) {
        // 10% conversion: 1000 coins -> 100 DASH
        const dashToMint = Math.floor(availableCoins * 0.1);
        const updatedUser = {
          ...user,
          dashBalance: user.dashBalance + dashToMint,
          gameCoins: 0, // Reset coins after successful claim
          sessions: (user.sessions || []).map(s => ({ ...s, claimed: true }))
        };
        setUser(updatedUser);
        localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
        setStatus(`Successfully Claimed ${dashToMint} $DASH!`);
      }

      setCoinsClaimed(true);
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      const errorMsg = err.reason || err.message || "Transaction failed";
      setStatus("Claim Failed: " + (errorMsg.length > 40 ? errorMsg.substring(0, 40) + "..." : errorMsg));
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

    // Ensure correct network
    if (caipNetwork && Number(caipNetwork.id) !== CHAIN_ID) {
      await switchNetwork(avalanche);
      return;
    }

    try {
      setStatus("Preparing On-Chain Record...");
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      // Standard ABI for a Scoreboard contract
      const scoreAbi = ["function submitScore(uint256 score) public"];
      const contract = new ethers.Contract(CONTRACT_ADDRESS, scoreAbi, signer);

      // ANTI-CHEAT: Client-side Sanity Check
      const v = user?.lastValidation;
      if (v) {
        // Example: If score > 1000 but duration < 30 seconds, it's impossible
        if (v.s > 1000 && v.d < 30000) {
            throw new Error("Invalid run metrics detected. Score discarded.");
        }
      }

      setStatus(`Recording Score (${score}) on Avalanche...`);
      
      const tx = await contract.submitScore(score);
      
      setStatus("Awaiting Block Finality...");
      await tx.wait();

      setStatus("Score Immutably Recorded!");

      // NEW: Sync to Supabase Leaderboard
      try {
        await supabase.from('leaderboard').upsert({
          address: address.toLowerCase(),
          username: user?.username || "Anonymous",
          score: score,
          timestamp: new Date().toISOString(),
          metadata: user?.lastValidation // Store the proof for admin review
        }, { onConflict: 'address' }); 
        
        fetchLeaderboard(); // Refresh local list
      } catch (supaErr) {
        console.error("Supabase Leaderboard Error:", supaErr);
      }

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

  const syncProgress = async (currentUser) => {
    if (!currentUser || !address) return;
    try {
      console.log("Syncing progress to cloud...");
      await supabase.from('profiles').upsert({
        address: address.toLowerCase(),
        game_coins: currentUser.gameCoins,
        total_points: currentUser.totalPoints,
        username: currentUser.username
      }, { onConflict: 'address' });
      console.log("Cloud sync successful!");
    } catch (err) {
      console.error("Cloud sync failed:", err);
    }
  };

  const [userRank, setUserRank] = useState(null);

  const fetchUserRank = async () => {
    if (!address) return;
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('score')
        .order('score', { ascending: false });

      if (data) {
        const index = data.findIndex(item => item.address?.toLowerCase() === address.toLowerCase());
        setUserRank(index !== -1 ? index + 1 : null);
      }
    } catch (err) {
      console.error("Rank fetch error:", err);
    }
  };

  const joinTournament = async () => {
    if (!user || user.dashBalance < 1000) {
      return alert("Insufficient $DASH! You need 1,000 $DASH to join the tournament.");
    }

    try {
      setStatus("Joining Tournament... (-1,000 $DASH)");
      const updatedUser = {
        ...user,
        dashBalance: user.dashBalance - 1000,
        isRanked: true
      };
      
      const { error } = await supabase.from('profiles').upsert({
        address: address.toLowerCase(),
        dash_balance: updatedUser.dashBalance,
        is_ranked: true
      }, { onConflict: 'address' });

      if (error) throw error;

      setUser(updatedUser);
      localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
      setStatus("Tournament Unlocked! Good luck!");
      fetchUserRank();
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("Failed to join tournament.");
    }
  };

  useEffect(() => {
    if (isConnected && user) {
        syncProgress(user);
        fetchUserRank();
    }
  }, [isConnected]);

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
            onConvertCoins={convertCoinsToDash}
            onJoinTournament={joinTournament}
            rank={userRank}
            status={status}
          />
          <TermsOfService isOpen={showTerms} onClose={() => setShowTerms(false)} />
          <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
        </>
      );
    }
    if (currentView === 'SHOP') {
      return <ShopPage onBack={() => setCurrentView('LANDING')} />;
    }
    return (
      <>
        <LandingPage
          startGame={startGame}
          payAndPlay={payAndPlay}
          claimBonus={claimBonus}
          user={user}
          wallet={address}
          connectWallet={connectWallet}
          status={status}
          setStatus={setStatus}
          prizePool={prizePool}
          leaderboard={leaderboard}
          onOpenAbout={() => setCurrentView('ABOUT')}
          onOpenProfile={() => setCurrentView('PROFILE')}
          onOpenShop={() => setCurrentView('SHOP')}
          onOpenTerms={() => setShowTerms(true)}
          onOpenPrivacy={() => setShowPrivacy(true)}
        />
        
        {/* Floating Social Link */}
        <a 
          href="https://x.com/TheSummerDash" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[60] group flex items-center gap-3"
        >
          <span className="bg-secondary text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 border-primary pixel-shadow opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
            Follow us on X
          </span>
          <div className="size-12 bg-primary text-secondary border-4 border-secondary flex items-center justify-center pixel-shadow hover:scale-110 active:scale-95 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
        </a>

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
            onRunComplete={onRunComplete}
            setScore={setScore}
            initialState={hasRevived ? { score: runObstacles, coins: runCoins, level: lastLevelReached, lives: 1 } : null}
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

                {/* Simplified Info Block instead of buttons */}
                <div className="w-full bg-white/5 border-2 border-white/20 p-4 mt-2">
                  <p className="text-xs md:text-sm font-bold opacity-80 uppercase leading-relaxed">
                    Coins & Progress Saved! <br/>
                    Visit your <span className="text-primary">Profile</span> to convert Coins & Submit to Leaderboard.
                  </p>
                </div>

                {!hasRevived && (
                  <button onClick={watchAd} className="border-4 border-white bg-blue-500 px-4 md:px-8 py-2 md:py-4 text-xs md:text-sm font-black uppercase text-white shadow-pixel hover:shadow-pixel-hover hover:-translate-y-1 transition-transform active:translate-y-1 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">play_circle</span>
                    Watch Ad to Revive & Continue
                  </button>
                )}
                <button onClick={() => { setGameState('START'); setCurrentView('PROFILE'); }} className="border-4 border-white bg-gray-600 px-4 md:px-8 py-2 md:py-4 text-base md:text-xl font-black uppercase text-white shadow-pixel hover:shadow-pixel-hover hover:-translate-y-1 transition-transform active:translate-y-1">
                  Profile
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
