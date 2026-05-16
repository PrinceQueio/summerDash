// VERSION: 1.0.5 - FIXED STRUCTURAL NESTING & DUPLICATES
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAppKitAccount, useAppKit, useAppKitProvider, useAppKitNetwork } from '@reown/appkit/react';
import { avalanche } from '@reown/appkit/networks';
import Game from './Game';
import ErrorBoundary from './ErrorBoundary';
import LandingPage from './LandingPage';
import GameRoom from './GameRoom';
import GameContainer from './GameContainer';
import AboutPage from './AboutPage';
import OrientationOverlay from './OrientationOverlay';
import ProfilePage from './ProfilePage';
import ShopPage from './ShopPage';
import { TermsOfService, PrivacyPolicy } from './LegalModals';
import { supabase } from './lib/supabase';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const RANKED_FEE_DASH = 1000;
const INITIAL_DASH = 5000;
const DAILY_REWARD = 500;
const CHAIN_ID = 43114;

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
  const [gameState, setGameState] = useState('START');
  const [currentView, setCurrentView] = useState('LANDING');
  const [score, setScore] = useState(0);
  const [runCoins, setRunCoins] = useState(0);
  const [runObstacles, setRunObstacles] = useState(0);
  const [status, setStatus] = useState('');
  const [prizePool, setPrizePool] = useState('250000');
  const [showSubmissionToast, setShowSubmissionToast] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [coinsClaimed, setCoinsClaimed] = useState(false);
  const [hasRevived, setHasRevived] = useState(false);
  const [isRanked, setIsRanked] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [needsSessionSign, setNeedsSessionSign] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [dailyLeaderboard, setDailyLeaderboard] = useState([]);
  const [user, setUser] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const [lastLevelReached, setLastLevelReached] = useState(1);

  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { walletProvider } = useAppKitProvider('eip155');
  const { caipNetwork, switchNetwork } = useAppKitNetwork();

  const wallet = isConnected ? address : null;

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
            const syncedUser = {
              ...savedStats,
              address,
              username: cloudProfile.username,
              usernameChanged: true,
              totalPoints: cloudProfile.total_points || savedStats.totalPoints || 0,
              dashBalance: cloudProfile.dash_balance || savedStats.dashBalance || 0,
              gameCoins: cloudProfile.game_coins || savedStats.gameCoins || 0,
              lastDailyClaim: cloudProfile.last_daily_claim || savedStats.lastDailyClaim || 0,
              lastPracticeSign: cloudProfile.last_practice_sign || savedStats.lastPracticeSign || 0,
              lastSessionSign: cloudProfile.last_session_sign || savedStats.lastSessionSign || 0,
              bonusClaimed: cloudProfile.bonus_claimed || savedStats.bonusClaimed || false,
              dailyScore: cloudProfile.daily_score || 0,
              dailyWins: cloudProfile.daily_wins || 0,
              globalLevel: calculateLevelFromXP(cloudProfile.total_points || savedStats.totalPoints || 0),
              sessions: savedStats.sessions || []
            };
            setUser(syncedUser);
            localStorage.setItem(localKey, JSON.stringify(syncedUser));
          } else {
            const newUser = {
              address,
              username: generateRandomUsername(),
              usernameChanged: false,
              totalPoints: 0,
              dashBalance: 0,
              gameCoins: 0,
              bonusClaimed: false,
              dailyScore: 0,
              dailyWins: 0,
              lastDailyClaim: 0,
              lastPracticeSign: 0,
              lastSessionSign: Math.floor(Date.now() / 1000),
              sessions: []
            };
            setUser(newUser);
            localStorage.setItem(localKey, JSON.stringify(newUser));
            await supabase.from('profiles').upsert({
              address: address.toLowerCase(),
              username: newUser.username,
              last_session_sign: newUser.lastSessionSign
            }, { onConflict: 'address' });
          }
        } catch (err) {
          console.error("Profile sync error:", err);
        }
      };
      syncCloudProfile();
    }
  }, [isConnected, address]);

  const updateUsername = async (newUsername) => {
    if (!user || !address) return;
    try {
      setStatus("Updating identity...");
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('address', address.toLowerCase());

      if (error) throw error;
      const updatedUser = { ...user, username: newUsername, usernameChanged: true };
      setUser(updatedUser);
      localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
      setStatus("Identity Updated!");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      console.error(err);
      setStatus("Update failed");
    }
  };

  const fetchDailyLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('address, username, daily_score, daily_wins')
        .gt('daily_score', 0)
        .order('daily_score', { ascending: false })
        .limit(10);
      if (error) throw error;
      setDailyLeaderboard(data.map(d => ({
        address: d.address,
        username: d.username,
        score: d.daily_score,
        wins: d.daily_wins
      })));
    } catch (err) {
      console.error("Daily leaderboard error:", err);
    }
  };

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
      fetchLeaderboard();
      fetchDailyLeaderboard();
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && caipNetwork && Number(caipNetwork.id) !== CHAIN_ID) {
      switchNetwork(avalanche).catch(console.error);
    }
  }, [isConnected, caipNetwork, switchNetwork]);

  const connectWallet = async () => {
    try { await open(); } catch (error) { console.error("Connection failed:", error); }
  };

  const startGame = () => {
    setScore(0);
    setRunCoins(0);
    setScoreSubmitted(false);
    setCoinsClaimed(false);
    setHasRevived(false);
    setGameState('PLAYING');
    setGameKey(prev => prev + 1);
    setTimeout(() => setStatus(""), 2000);
  };

  const claimDailyReward = async () => {
    if (!isConnected || !walletProvider) return;
    try {
      setStatus("Preparing Daily Sign-In...");
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const abi = ["function claimDailyReward() public payable"];
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.claimDailyReward({ value: 0 });
      setStatus("Verifying Sign-In...");
      await tx.wait();
      const now = Math.floor(Date.now() / 1000);
      const updatedUser = { ...user, dashBalance: user.dashBalance + DAILY_REWARD, lastDailyClaim: now, lastSessionSign: now };
      setUser(updatedUser);
      localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
      await supabase.from('profiles').upsert({
        address: address.toLowerCase(),
        dash_balance: updatedUser.dashBalance,
        last_daily_claim: now,
        last_session_sign: now
      }, { onConflict: 'address' });
      setNeedsSessionSign(false);
      setStatus("Daily Sign-In Successful!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("Sign-In Failed");
    }
  };

  const claimBonus = async () => {
    if (!isConnected || !walletProvider) return;
    try {
      setStatus("Preparing Bonus Claim...");
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const abi = ["function claimBonus() public payable", "function bonusClaimFee() public view returns (uint256)"];
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const fee = await contract.bonusClaimFee();
      const tx = await contract.claimBonus({ value: fee });
      setStatus("Confirming Claim...");
      await tx.wait();
      const updatedUser = { ...user, dashBalance: user.dashBalance + INITIAL_DASH, bonusClaimed: true };
      setUser(updatedUser);
      localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
      await supabase.from('profiles').upsert({ address: address.toLowerCase(), dash_balance: updatedUser.dashBalance, bonus_claimed: true }, { onConflict: 'address' });
      setStatus("Bonus Claimed!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("Claim Failed");
    }
  };

  const payAndPlay = async (isRankedMode = true) => {
    if (!isConnected) { connectWallet(); return; }
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      setIsRanked(isRankedMode);
      if (isRankedMode) {
        if ((user?.dashBalance || 0) < RANKED_FEE_DASH) return alert("Insufficient $DASH");
        const tx = await signer.sendTransaction({ to: CONTRACT_ADDRESS, value: 0 });
        setStatus("Confirming Entry...");
        await tx.wait();
        const now = Math.floor(Date.now() / 1000);
        const updatedUser = { ...user, dashBalance: user.dashBalance - RANKED_FEE_DASH, lastSessionSign: now };
        setUser(updatedUser);
        localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
        await supabase.from('profiles').upsert({ address: address.toLowerCase(), dash_balance: updatedUser.dashBalance, last_session_sign: now }, { onConflict: 'address' });
      } else {
        const now = Math.floor(Date.now() / 1000);
        if (now - (user?.lastPracticeSign || 0) > 86400) {
          const tx = await signer.sendTransaction({ to: CONTRACT_ADDRESS, value: 0 });
          await tx.wait();
          const updatedUser = { ...user, lastPracticeSign: now, lastSessionSign: now };
          setUser(updatedUser);
          localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
          await supabase.from('profiles').upsert({ address: address.toLowerCase(), last_practice_sign: now, last_session_sign: now }, { onConflict: 'address' });
        } else {
          const message = `Authorize Practice Run\nPlayer: ${address}\nTime: ${Date.now()}`;
          await signer.signMessage(message);
        }
      }
      startGame();
    } catch (err) {
      console.error(err);
      setStatus("Auth Failed");
    }
  };

  const onRunComplete = async (scoreInfo) => {
    const totalPoints = (scoreInfo.score || 0) + (scoreInfo.coins || 0);
    setScore(totalPoints);
    setRunCoins(scoreInfo.coins || 0);
    setRunObstacles(scoreInfo.score || 0);
    setLastLevelReached(scoreInfo.level || 1);
    setGameState('GAMEOVER');
    if (user) {
      const updatedUser = {
        ...user,
        gameCoins: (user.gameCoins || 0) + (scoreInfo.coins || 0),
        totalPoints: (user.totalPoints || 0) + totalPoints,
        dailyScore: Math.max(user.dailyScore || 0, scoreInfo.score)
      };
      setUser(updatedUser);
      localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
      await supabase.from('profiles').upsert({ address: address.toLowerCase(), game_coins: updatedUser.gameCoins, total_points: updatedUser.totalPoints, daily_score: updatedUser.dailyScore }, { onConflict: 'address' });
    }
  };

  const convertCoinsToDash = async () => {
    if (!isConnected || !walletProvider) return;
    const availableCoins = user?.gameCoins || 0;
    if (availableCoins < 1000) return alert("Min 1,000 Coins");
    try {
      setStatus("Converting...");
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const abi = ["function convertPracticeCoins(uint256 _gameCoins, bytes32 _runId, bytes memory _signature) public payable"];
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.convertPracticeCoins(availableCoins, ethers.id(Date.now().toString()), "0x", { value: ethers.parseEther("0.05") });
      await tx.wait();
      const dashToMint = Math.floor(availableCoins * 0.1);
      const updatedUser = { ...user, dashBalance: user.dashBalance + dashToMint, gameCoins: 0 };
      setUser(updatedUser);
      localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
      setStatus("Converted!");
    } catch (err) {
      console.error(err);
      setStatus("Conversion Failed");
    }
  };

  const watchAd = () => {
    if (hasRevived) return;
    setStatus("Watching Ad...");
    setTimeout(() => {
      setHasRevived(true);
      setGameState('PLAYING');
      setGameKey(prev => prev + 1);
      setStatus("");
    }, 3000);
  };

  const submitScore = async () => {
    if (!isConnected || !walletProvider) return;
    try {
      setStatus("Submitting...");
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const abi = ["function submitScore(uint256 score) public"];
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.submitScore(score);
      await tx.wait();
      await supabase.from('leaderboard').upsert({ address: address.toLowerCase(), username: user?.username || "Anonymous", score: score, timestamp: new Date().toISOString() }, { onConflict: 'address' });
      setScoreSubmitted(true);
      setStatus("Submitted!");
      fetchLeaderboard();
    } catch (err) {
      console.error(err);
      setStatus("Submission Failed");
    }
  };

  const verifySession = async () => {
    if (!walletProvider || !user) return;
    try {
      setStatus("Verifying Session...");
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      await signer.signMessage(`SummerDash Session Verification\nPlayer: ${address}\nTime: ${new Date().toISOString()}`);
      const now = Math.floor(Date.now() / 1000);
      const updatedUser = { ...user, lastSessionSign: now };
      setUser(updatedUser);
      localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
      await supabase.from('profiles').upsert({ address: address.toLowerCase(), last_session_sign: now }, { onConflict: 'address' });
      setNeedsSessionSign(false);
      setStatus("Session Verified!");
    } catch (err) {
      console.error(err);
      setStatus("Verification Failed");
    }
  };

  useEffect(() => {
    if (isConnected && user) {
      const lastSign = user.lastSessionSign || 0;
      if (Math.floor(Date.now() / 1000) - lastSign > 7200) setNeedsSessionSign(true);
    }
  }, [isConnected, user]);

  if (gameState === 'START') {
    if (currentView === 'ABOUT') return <AboutPage onBack={() => setCurrentView('LANDING')} startGame={() => payAndPlay(false)} status={status} />;
    if (currentView === 'PROFILE' && user) return <ProfilePage user={user} onBack={() => setCurrentView('LANDING')} onUpdateUsername={updateUsername} onDisconnect={() => open({ view: 'Account' })} onConvertCoins={convertCoinsToDash} onJoinTournament={() => {}} onClaimDaily={claimDailyReward} rank={userRank} status={status} />;
    if (currentView === 'SHOP') return <ShopPage onBack={() => setCurrentView('LANDING')} />;
    if (currentView === 'GAMEROOM') return <GameRoom wallet={address} connectWallet={connectWallet} user={user} payAndPlay={payAndPlay} claimBonus={claimBonus} prizePool={prizePool} leaderboard={dailyLeaderboard} status={status} onBack={() => setCurrentView('LANDING')} />;
    
    return (
      <>
        <LandingPage
          startGame={startGame}
          payAndPlay={() => setCurrentView('GAMEROOM')}
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
        <TermsOfService isOpen={showTerms} onClose={() => setShowTerms(false)} />
        <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      </>
    );
  }

  return (
    <OrientationOverlay>
      <div className="relative w-full h-screen bg-black">
        {gameState === 'PLAYING' && <GameContainer key={gameKey} onRunComplete={onRunComplete} setScore={setScore} initialState={hasRevived ? { score: runObstacles, coins: runCoins, level: lastLevelReached, lives: 1 } : null} onExit={() => setGameState('START')} />}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="flex flex-col gap-6 text-white items-center text-center p-8 border-4 border-white bg-black shadow-pixel max-w-lg w-full">
              <h1 className="text-6xl font-black uppercase text-red-600 text-shadow-pixel">GAME OVER</h1>
              <div className="flex flex-col gap-2 w-full max-w-xs text-xl">
                <div className="flex justify-between border-b border-white/20 pb-1"><span>OBSTACLES:</span><span>{runObstacles}</span></div>
                <div className="flex justify-between border-b border-white/20 pb-1 text-primary"><span>COINS:</span><span>{runCoins}</span></div>
                <h2 className="text-5xl font-black mt-4">SCORE: {score}</h2>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <button onClick={() => payAndPlay(isRanked)} className="border-4 border-white bg-primary px-8 py-4 text-xl font-black uppercase text-black shadow-pixel hover:-translate-y-1 transition-transform">Try Again</button>
                {!hasRevived && <button onClick={watchAd} className="border-4 border-white bg-blue-500 px-8 py-4 text-sm font-black uppercase text-white shadow-pixel hover:-translate-y-1 transition-transform">Watch Ad to Revive</button>}
                <button onClick={() => { setGameState('START'); setCurrentView('PROFILE'); }} className="border-4 border-white bg-gray-600 px-8 py-4 text-xl font-black uppercase text-white shadow-pixel hover:-translate-y-1 transition-transform">Profile</button>
              </div>
              {status && <div className="mt-4 text-yellow-500">{status}</div>}
            </div>
          </div>
        )}
      </div>
      {needsSessionSign && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white border-4 border-primary p-8 max-w-sm w-full text-center pixel-shadow">
            <h2 className="text-2xl font-black uppercase mb-2">Session Expired</h2>
            <button onClick={verifySession} className="w-full bg-primary text-secondary py-4 text-sm font-black uppercase border-4 border-secondary pixel-shadow">Sign Wallet (Free)</button>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}

export default App;
