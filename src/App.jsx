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
  const [isProcessing, setIsProcessing] = useState(false);
  const [prizePool, setPrizePool] = useState('250000');
  const [showSubmissionToast, setShowSubmissionToast] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [coinsClaimed, setCoinsClaimed] = useState(false);
  const [hasRevived, setHasRevived] = useState(false);
  const [isRanked, setIsRanked] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const isVerifyingSessionRef = React.useRef(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [dailyLeaderboard, setDailyLeaderboard] = useState([]);
  const [user, setUser] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const [lastLevelReached, setLastLevelReached] = useState(1);
  const [showNoWalletWarning, setShowNoWalletWarning] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingUnconnectedRun, setPendingUnconnectedRun] = useState(false);
  const [runDuration, setRunDuration] = useState(0);
  const [showVerifyAndSyncModal, setShowVerifyAndSyncModal] = useState(false);

  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { walletProvider } = useAppKitProvider('eip155');
  const { caipNetwork, switchNetwork } = useAppKitNetwork();

  const wallet = address || null;

  useEffect(() => {
    if (!address && currentView === 'PROFILE') {
      setCurrentView('LANDING');
    }
  }, [address, currentView]);

  const syncCloudProfile = useCallback(async (userAddress) => {
    if (!userAddress) return;
    try {
      const { data: cloudProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('address', userAddress.toLowerCase())
        .single();

      const localKey = `sd_user_${userAddress.toLowerCase()}`;
      const savedStats = JSON.parse(localStorage.getItem(localKey)) || {};

      let syncedUser;
      if (cloudProfile) {
        syncedUser = {
          ...savedStats,
          address: userAddress,
          username: cloudProfile.username,
          usernameChanged: cloudProfile.username ? !cloudProfile.username.includes('_') : false,
          // Trust cloud profile entirely for secure fields
          totalPoints: cloudProfile.total_points || 0,
          dashBalance: cloudProfile.dash_balance || 0,
          gameCoins: cloudProfile.game_coins || 0,
          lastDailyClaim: cloudProfile.last_daily_claim || 0,
          lastPracticeSign: cloudProfile.last_practice_sign || 0,
          lastSessionSign: cloudProfile.last_session_sign || 0,
          bonusClaimed: cloudProfile.bonus_claimed || false,
          dailyScore: cloudProfile.daily_score || 0,
          dailyWins: cloudProfile.daily_wins || 0,
          globalLevel: calculateLevelFromXP(cloudProfile.total_points || 0),
          sessions: savedStats.sessions || []
        };
      } else {
        const randomUsername = generateRandomUsername();
        syncedUser = {
          address: userAddress,
          username: randomUsername,
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
      }

      setUser(syncedUser);
      localStorage.setItem(localKey, JSON.stringify(syncedUser));

      fetchDailyLeaderboard();
      fetchLeaderboard();
    } catch (err) {
      console.error("Profile sync error:", err);
    }
  }, []);

  useEffect(() => {
    if (address) {
      if (pendingUnconnectedRun) {
        setShowVerifyAndSyncModal(true);
      } else {
        syncCloudProfile(address, false);
      }
    }
  }, [address, pendingUnconnectedRun, syncCloudProfile]);

  const handleVerifyAndSync = async () => {
    if (!address || !walletProvider) return;
    try {
      setStatus("Preparing Session Verification...");
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      const now = Math.floor(Date.now() / 1000);
      
      const { data: cloudProfile } = await supabase
        .from('profiles')
        .select('last_practice_sign, last_session_sign')
        .eq('address', address.toLowerCase())
        .single();
      
      const lastPracticeSign = cloudProfile?.last_practice_sign || 0;
      const lastSessionSign = cloudProfile?.last_session_sign || 0;

      if (now - lastPracticeSign > 86400) {
        setStatus("Verification transaction required...");
        const tx = await signer.sendTransaction({ to: CONTRACT_ADDRESS, value: 0 });
        setStatus("Verifying transaction...");
        await tx.wait();
        
        await supabase.from('profiles').upsert({ 
          address: address.toLowerCase(), 
          last_practice_sign: now, 
          last_session_sign: now 
        }, { onConflict: 'address' });
        
        sessionStorage.setItem('sd_session_active', 'true');
      } else {
        const isSessionActive = sessionStorage.getItem('sd_session_active') === 'true';
        if (isSessionActive && (now - lastSessionSign <= 7200)) {
          console.log("[handleVerifyAndSync] Active session detected.");
        } else {
          setStatus("Signature request...");
          const message = `Authorize Practice Run\nPlayer: ${address}\nTime: ${Date.now()}`;
          await signer.signMessage(message);
          
          await supabase.from('profiles').upsert({ 
            address: address.toLowerCase(), 
            last_session_sign: now 
          }, { onConflict: 'address' });
          
          sessionStorage.setItem('sd_session_active', 'true');
        }
      }

      setStatus("Verifying run with backend...");
      const response = await fetch('/api/verify-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerAddress: address,
          score: runObstacles,
          coins: runCoins,
          runDuration: runDuration
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to verify run");

      const newSession = {
        date: new Date().toISOString(),
        obstacles: runObstacles,
        coins: runCoins,
        level: lastLevelReached,
        claimed: false
      };

      const updatedUser = {
        ...user,
        gameCoins: data.gameCoins,
        totalPoints: data.totalPoints,
        dailyScore: data.dailyScore,
        sessions: [newSession, ...(user?.sessions || [])]
      };
      
      setUser(updatedUser);
      localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));

      await syncCloudProfile(address);
      setShowVerifyAndSyncModal(false);
      setPendingUnconnectedRun(false);
      setStatus("Progress Saved successfully!");
      setTimeout(() => setStatus(""), 4000);
    } catch (err) {
      console.error(err);
      setStatus("Verification Failed: " + (err.message || "Unknown error"));
    }
  };

  const updateUsername = async (newUsername) => {
    if (!user || !address) return false;
    
    if (!/^[a-zA-Z0-9]+$/.test(newUsername)) {
      setStatus("Letters & numbers only!");
      setTimeout(() => setStatus(""), 3000);
      return false;
    }

    try {
      setStatus("Checking availability...");
      
      const { data: existing } = await supabase
        .from('profiles')
        .select('address')
        .ilike('username', newUsername)
        .neq('address', address.toLowerCase())
        .maybeSingle();
        
      if (existing) {
        setStatus("Username taken!");
        setTimeout(() => setStatus(""), 3000);
        return false;
      }

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
      return true;
    } catch (err) {
      console.error(err);
      setStatus("Update failed");
      return false;
    }
  };

  const checkUsernameAvailability = async (newUsername) => {
    if (!newUsername || newUsername.trim().length < 5) {
      return { available: false, message: "Must be at least 5 characters" };
    }
    if (!/^[a-zA-Z0-9]+$/.test(newUsername.trim())) {
      return { available: false, message: "Letters & numbers only" };
    }
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('address')
        .ilike('username', newUsername.trim())
        .neq('address', address?.toLowerCase() || '')
        .maybeSingle();
        
      if (existing) {
        return { available: false, message: "Username taken" };
      }
      return { available: true, message: "Username available!" };
    } catch (err) {
      return { available: false, message: "Error checking availability" };
    }
  };

  const fetchDailyLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('address, username, daily_score, daily_wins')
        .gt('daily_score', 0)
        .order('daily_score', { ascending: false })
        .limit(50);
      if (error) throw error;
      const mapped = data.map(d => ({
        address: d.address,
        username: d.username,
        score: d.daily_score,
        wins: d.daily_wins
      }));
      setDailyLeaderboard(mapped);

      if (address) {
        const { data: userProfile, error: profileErr } = await supabase
          .from('profiles')
          .select('daily_score')
          .eq('address', address.toLowerCase())
          .single();

        if (!profileErr && userProfile && userProfile.daily_score > 0) {
          const currentScore = userProfile.daily_score;
          const index = mapped.findIndex(d => d.address.toLowerCase() === address.toLowerCase());
          if (index !== -1) {
            setUserRank(index + 1);
          } else {
            const { count, error: countError } = await supabase
              .from('profiles')
              .select('address', { count: 'exact', head: true })
              .gt('daily_score', currentScore);
            if (!countError) {
              setUserRank(count + 1);
            } else {
              setUserRank(null);
            }
          }
        } else {
          setUserRank(null);
        }
      } else {
        setUserRank(null);
      }
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
        .limit(50);
      if (error) throw error;
      setLeaderboard(data || []);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchDailyLeaderboard();
  }, [address, user?.dailyScore]);

  const isWrongNetwork = address && caipNetwork && Number(caipNetwork.id) !== CHAIN_ID;

  const wrongNetworkModal = isWrongNetwork && (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white border-8 border-primary p-8 max-w-md w-full text-center pixel-shadow relative text-secondary">
        <h2 className="text-3xl font-black uppercase mb-4 text-red-600">Wrong Network</h2>
        <p className="text-xs font-bold uppercase text-gray-500 mb-8 leading-relaxed">
          Summer Dash is live on Avalanche. Please switch your network to continue.
        </p>
        <button 
          onClick={() => switchNetwork(avalanche).catch(console.error)} 
          className="w-full bg-primary text-secondary py-4 text-sm font-black uppercase border-4 border-secondary pixel-shadow hover:scale-105 active:translate-y-1 transition-all"
        >
          Switch to Avalanche
        </button>
      </div>
    </div>
  );

  const connectWallet = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try { await open(); } catch (error) { console.error("Connection failed:", error); }
    finally { setIsProcessing(false); }
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
    if (!address || !walletProvider || isProcessing) return;
    setIsProcessing(true);
    try {
      setStatus("Preparing Daily Sign-In...");
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const abi = ["function claimDailyReward() public payable"];
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.claimDailyReward({ value: 0, gasLimit: 300000 });
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
      sessionStorage.setItem('sd_session_active', 'true');
      setNeedsSessionSign(false);
      setStatus("Daily Sign-In Successful!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      if (err?.code === "INSUFFICIENT_FUNDS" || err?.message?.includes("insufficient funds")) {
        setStatus("Need AVAX for Gas!");
      } else {
        setStatus("Sign-In Failed");
      }
      setTimeout(() => setStatus(""), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const claimBonus = async () => {
    if (!address || !walletProvider || isProcessing) return;
    setIsProcessing(true);
    try {
      setStatus("Preparing Bonus Claim...");
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const abi = ["function claimBonus() public payable", "function bonusClaimFee() public view returns (uint256)"];
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const fee = await contract.bonusClaimFee();
      const tx = await contract.claimBonus({ value: fee, gasLimit: 300000 });
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
      if (err?.code === "INSUFFICIENT_FUNDS" || err?.message?.includes("insufficient funds")) {
        setStatus("Need AVAX for Gas!");
      } else {
        setStatus("Claim Failed");
      }
      setTimeout(() => setStatus(""), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const payAndPlay = async (isRankedMode = true) => {
    if (isProcessing) return;
    if (!address) {
      setShowNoWalletWarning(true);
      setIsRanked(isRankedMode);
      return;
    }
    setIsProcessing(true);
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      setIsRanked(isRankedMode);
      if (isRankedMode) {
        if ((user?.dashBalance || 0) < RANKED_FEE_DASH) {
          setIsProcessing(false);
          return alert("Insufficient $DASH");
        }
        const tx = await signer.sendTransaction({ to: CONTRACT_ADDRESS, value: 0 });
        setStatus("Confirming Entry...");
        await tx.wait();
        const now = Math.floor(Date.now() / 1000);
        const updatedUser = { ...user, dashBalance: user.dashBalance - RANKED_FEE_DASH, lastSessionSign: now };
        setUser(updatedUser);
        localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
        await supabase.from('profiles').upsert({ address: address.toLowerCase(), dash_balance: updatedUser.dashBalance, last_session_sign: now }, { onConflict: 'address' });
        sessionStorage.setItem('sd_session_active', 'true');
      } else {
        const now = Math.floor(Date.now() / 1000);
        if (now - (user?.lastPracticeSign || 0) > 86400) {
          const tx = await signer.sendTransaction({ to: CONTRACT_ADDRESS, value: 0, gasLimit: 100000 });
          await tx.wait();
          const updatedUser = { ...user, lastPracticeSign: now, lastSessionSign: now };
          setUser(updatedUser);
          localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
          await supabase.from('profiles').upsert({ address: address.toLowerCase(), last_practice_sign: now, last_session_sign: now }, { onConflict: 'address' });
          sessionStorage.setItem('sd_session_active', 'true');
        } else {
          const isSessionActive = sessionStorage.getItem('sd_session_active') === 'true';
          if (isSessionActive && (now - (user?.lastSessionSign || 0) <= 7200)) {
            console.log("[payAndPlay] Active session detected. Skipping wallet signature.");
          } else {
            const message = `Authorize Practice Run\nPlayer: ${address}\nTime: ${Date.now()}`;
            await signer.signMessage(message);
            const updatedUser = { ...user, lastSessionSign: now };
            setUser(updatedUser);
            localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
            await supabase.from('profiles').upsert({ address: address.toLowerCase(), last_session_sign: now }, { onConflict: 'address' });
            sessionStorage.setItem('sd_session_active', 'true');
          }
        }
      }
      startGame();
    } catch (err) {
      console.error(err);
      if (err?.code === "INSUFFICIENT_FUNDS" || err?.message?.includes("insufficient funds")) {
        setStatus("Need AVAX for Gas!");
      } else {
        setStatus("Auth Failed");
      }
      setTimeout(() => setStatus(""), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const onRunComplete = async (scoreInfo) => {
    const currentRunScore = scoreInfo.score || 0;
    const currentRunCoins = scoreInfo.coins || 0;
    const duration = scoreInfo.validation?.d || 0;

    // Calculate deltas so we don't double-count on revive
    // We allow negative deltas if they hit an obstacle that deducted points during the revive!
    const deltaScore = hasRevived ? (currentRunScore - runObstacles) : currentRunScore;
    const deltaCoins = hasRevived ? (currentRunCoins - runCoins) : currentRunCoins;
    
    // UI state requires cumulative totals
    const cumulativeTotalPoints = currentRunScore + currentRunCoins;
    setScore(cumulativeTotalPoints);
    setRunCoins(currentRunCoins);
    setRunObstacles(currentRunScore);
    setLastLevelReached(scoreInfo.level || 1);
    setRunDuration(duration);
    setGameState('GAMEOVER');

    if (address && user) {
      const newSession = {
        date: new Date().toISOString(),
        obstacles: deltaScore, // Log only the points earned in this specific life
        coins: deltaCoins,
        level: scoreInfo.level || 1,
        claimed: false
      };

      try {
        setStatus("Verifying run securely...");
        const response = await fetch('/api/verify-run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerAddress: address,
            score: deltaScore,
            coins: deltaCoins,
            runDuration: duration
          })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          const updatedUser = {
            ...user,
            gameCoins: data.gameCoins,
            totalPoints: data.totalPoints,
            dailyScore: data.dailyScore,
            sessions: [newSession, ...(user.sessions || [])]
          };
          setUser(updatedUser);
          localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
          setStatus("Run verified and saved!");
          setTimeout(() => setStatus(""), 4000);
        } else {
          console.error("Backend verification failed:", data.error);
          setStatus("Verification failed! " + data.error);
        }
      } catch (err) {
        console.error("Network error saving run:", err);
        setStatus("Network Error: Run discarded");
      }
      
      fetchDailyLeaderboard();
      fetchLeaderboard();
    } else {
      setPendingUnconnectedRun(true);
    }
  };

  const convertCoinsToDash = async () => {
    if (!address || !walletProvider || isProcessing) return;
    const availableCoins = user?.gameCoins || 0;
    if (availableCoins < 1000) return alert("Min 1,000 Coins");
    setIsProcessing(true);
    try {
      setStatus("Converting...");
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      
      const runId = ethers.id(Date.now().toString());
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
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get signature");

      const abi = ["function convertPracticeCoins(uint256 _gameCoins, bytes32 _runId, bytes memory _signature) public payable"];
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.convertPracticeCoins(availableCoins, runId, data.signature, { value: ethers.parseEther("0.05"), gasLimit: 300000 });
      await tx.wait();
      
      const dashToMint = Math.floor(availableCoins * 0.1);
      const updatedSessions = (user.sessions || []).map(s => ({ ...s, claimed: true }));
      const updatedUser = { ...user, dashBalance: user.dashBalance + dashToMint, gameCoins: 0, sessions: updatedSessions };
      setUser(updatedUser);
      localStorage.setItem(`sd_user_${address.toLowerCase()}`, JSON.stringify(updatedUser));
      setStatus("Converted!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      if (err?.code === "INSUFFICIENT_FUNDS" || err?.message?.includes("insufficient funds")) {
        setStatus("Need AVAX for Gas & Fee!");
      } else {
        setStatus("Conversion Failed");
      }
      setTimeout(() => setStatus(""), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const watchAd = () => {
    if (hasRevived || isProcessing) return;
    setIsProcessing(true);
    setStatus("Watching Ad...");

    // Open the Direct Link in a new tab
    window.open('https://www.effectivecpmnetwork.com/duc3b1yv4m?key=626481e149935efc21328f76d5766faf', '_blank');

    setTimeout(() => {
      setHasRevived(true);
      setGameState('PLAYING');
      setGameKey(prev => prev + 1);
      setStatus("");
      setIsProcessing(false);
    }, 3000);
  };

  const submitScore = async () => {
    if (!address || !walletProvider) return;
    try {
      setStatus("Submitting...");
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      const currentTournamentId = 1; // Assuming tournament 1 for now
      const response = await fetch('/api/sign-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerAddress: address,
          username: user?.username,
          score: score,
          tournamentId: currentTournamentId,
          contractAddress: CONTRACT_ADDRESS,
          chainId: CHAIN_ID
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get signature");

      const abi = ["function submitScore(uint256 _score, bytes memory _signature) external"];
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.submitScore(score, data.signature);
      await tx.wait();
      
      setScoreSubmitted(true);
      setStatus("Submitted!");
      fetchLeaderboard();
    } catch (err) {
      console.error(err);
      setStatus("Submission Failed");
    }
  };

  const verifySession = async () => {
    if (!walletProvider || !user || isVerifyingSessionRef.current) return;
    isVerifyingSessionRef.current = true;
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
      sessionStorage.setItem('sd_session_active', 'true');
      setStatus("Session Verified!");
    } catch (err) {
      console.error(err);
      setStatus("Verification Failed");
    } finally {
      isVerifyingSessionRef.current = false;
    }
  };

  useEffect(() => {
    if (address && user) {
      const lastSign = user.lastSessionSign || 0;
      const isSessionActive = sessionStorage.getItem('sd_session_active') === 'true';
      if (Math.floor(Date.now() / 1000) - lastSign > 7200 || !isSessionActive) {
        verifySession();
      }
    }
  }, [address, user]);

  const handleExitGame = () => {
    if (!address) {
      setShowExitConfirm(true);
    } else {
      setGameState('START');
    }
  };

  const handleGoHomeFromGameOver = () => {
    if (!address) {
      setShowExitConfirm(true);
    } else {
      setGameState('START');
      setCurrentView('LANDING');
    }
  };

  if (gameState === 'START') {
    let activeViewNode = null;
    if (currentView === 'ABOUT') {
      activeViewNode = <AboutPage onBack={() => setCurrentView('LANDING')} startGame={() => payAndPlay(false)} status={status} isProcessing={isProcessing} />;
    } else if (currentView === 'PROFILE' && user) {
      activeViewNode = <ProfilePage user={user} onBack={() => setCurrentView('LANDING')} onUpdateUsername={updateUsername} onCheckUsername={checkUsernameAvailability} onDisconnect={() => open({ view: 'Account' })} onConvertCoins={convertCoinsToDash} onJoinTournament={() => {}} onClaimDaily={claimDailyReward} onPlay={payAndPlay} rank={userRank} status={status} onGoToGameroom={() => setCurrentView('GAMEROOM')} isProcessing={isProcessing} />;
    } else if (currentView === 'SHOP') {
      activeViewNode = <ShopPage onBack={() => setCurrentView('LANDING')} />;
    } else if (currentView === 'GAMEROOM') {
      activeViewNode = <GameRoom wallet={address} connectWallet={connectWallet} user={user} payAndPlay={payAndPlay} claimBonus={claimBonus} prizePool={prizePool} leaderboard={dailyLeaderboard} userRank={userRank} status={status} onBack={() => setCurrentView('LANDING')} onOpenProfile={() => setCurrentView('PROFILE')} isProcessing={isProcessing} />;
    } else {
      activeViewNode = (
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
            leaderboard={dailyLeaderboard}
            onOpenAbout={() => setCurrentView('ABOUT')}
            onOpenProfile={() => setCurrentView('PROFILE')}
            onOpenShop={() => setCurrentView('SHOP')}
            onOpenTerms={() => setShowTerms(true)}
            onOpenPrivacy={() => setShowPrivacy(true)}
            isProcessing={isProcessing}
          />
          <TermsOfService isOpen={showTerms} onClose={() => setShowTerms(false)} />
          <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
        </>
      );
    }

    return (
      <OrientationOverlay active={false}>
        {activeViewNode}
        {wrongNetworkModal}

        {showNoWalletWarning && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white border-8 border-primary p-8 max-w-md w-full text-center pixel-shadow relative text-secondary">
              <h2 className="text-3xl font-black uppercase mb-4 text-red-600">Points Unsaved!</h2>
              <p className="text-xs font-bold uppercase text-gray-500 mb-8 leading-relaxed">
                Your wallet is not connected. If you play now, your game scores will not be recorded on the leaderboards.
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={async () => {
                    setShowNoWalletWarning(false);
                    await connectWallet();
                  }} 
                  className="w-full bg-primary text-secondary py-4 text-sm font-black uppercase border-4 border-secondary pixel-shadow hover:scale-105 active:translate-y-1 transition-all"
                >
                  Connect Wallet
                </button>
                <button 
                  onClick={() => {
                    setShowNoWalletWarning(false);
                    startGame();
                  }} 
                  className="w-full bg-gray-200 text-secondary py-4 text-sm font-black uppercase border-4 border-gray-400 pixel-shadow hover:scale-105 active:translate-y-1 transition-all"
                >
                  Play Anyway
                </button>
              </div>
            </div>
          </div>
        )}
        {showExitConfirm && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white border-8 border-primary p-8 max-w-sm w-full text-center pixel-shadow relative text-secondary">
              <h2 className="text-3xl font-black uppercase mb-4 text-red-600">Lose Progress?</h2>
              <p className="text-xs font-bold uppercase text-gray-500 mb-8 leading-relaxed">
                Your wallet is not connected. Leaving now will permanently discard your game progress.
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    setShowExitConfirm(false);
                    setGameState('START');
                    setCurrentView('LANDING');
                  }} 
                  className="w-full bg-red-600 text-white py-4 text-sm font-black uppercase border-4 border-black pixel-shadow hover:scale-105 active:translate-y-1 transition-all"
                >
                  Yes, Discard Score
                </button>
                <button 
                  onClick={() => setShowExitConfirm(false)} 
                  className="w-full bg-gray-200 text-secondary py-4 text-sm font-black uppercase border-4 border-gray-400 pixel-shadow hover:scale-105 active:translate-y-1 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showVerifyAndSyncModal && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white border-8 border-primary p-8 max-w-md w-full text-center pixel-shadow relative text-secondary">
              <h2 className="text-3xl font-black uppercase mb-4 text-primary">Sync Progress</h2>
              <p className="text-xs font-bold uppercase text-gray-500 mb-8 leading-relaxed">
                Please complete the verification transaction or signature to save your score and coins to your profile!
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleVerifyAndSync} 
                  className="w-full bg-primary text-secondary py-4 text-sm font-black uppercase border-4 border-secondary pixel-shadow hover:scale-105 active:translate-y-1 transition-all"
                >
                  Verify & Sync Progress
                </button>
                <button 
                  onClick={() => {
                    setShowVerifyAndSyncModal(false);
                    setPendingUnconnectedRun(false);
                  }} 
                  className="w-full bg-gray-200 text-secondary py-4 text-sm font-black uppercase border-4 border-gray-400 pixel-shadow hover:scale-105 active:translate-y-1 transition-all"
                >
                  Discard Score
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Support Icon */}
        <a 
          href="mailto:Summerdash247@gmail.com" 
          className="fixed bottom-6 right-6 z-[100] bg-primary text-secondary p-3 rounded-full border-2 border-secondary pixel-shadow-sm hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
          title="Contact Support"
        >
          <span className="material-symbols-outlined text-2xl group-hover:animate-pulse">support_agent</span>
        </a>
      </OrientationOverlay>
    );
  }

  return (
    <OrientationOverlay>
      {wrongNetworkModal}
      <div className="relative w-full h-screen bg-black">
        {gameState === 'PLAYING' && <GameContainer key={gameKey} onRunComplete={onRunComplete} setScore={setScore} initialState={hasRevived ? { score: runObstacles, coins: runCoins, level: lastLevelReached, lives: 1 } : null} onExit={handleExitGame} />}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 overflow-hidden">
            <div className="flex flex-col gap-3 text-white items-center text-center p-4 border-2 border-white bg-black shadow-pixel max-w-sm w-full overflow-y-auto max-h-full">
              <h1 className="text-3xl font-black uppercase text-red-600 text-shadow-pixel shrink-0">GAME OVER</h1>
              <div className="flex flex-col gap-1 w-full max-w-xs text-sm shrink-0">
                <div className="flex justify-between border-b border-white/20 pb-1"><span>OBSTACLES:</span><span>{runObstacles}</span></div>
                <div className="flex justify-between border-b border-white/20 pb-1 text-primary"><span>COINS:</span><span>{runCoins}</span></div>
                <h2 className="text-2xl font-black mt-2">SCORE: {score}</h2>
              </div>
              
              {address ? (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <button onClick={() => payAndPlay(isRanked)} disabled={isProcessing} className={`border-2 border-white bg-primary px-4 py-2 text-sm font-black uppercase text-black shadow-pixel transition-transform ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}>{isProcessing ? 'Loading...' : 'Try Again'}</button>
                  {!hasRevived && <button onClick={watchAd} disabled={isProcessing} className={`border-2 border-white bg-blue-500 px-4 py-2 text-xs font-black uppercase text-white shadow-pixel transition-transform ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}>{isProcessing ? 'Loading...' : 'Watch Ad to Revive'}</button>}
                  <button onClick={() => { setGameState('START'); setCurrentView('PROFILE'); }} disabled={isProcessing} className={`border-2 border-white bg-gray-600 px-4 py-2 text-sm font-black uppercase text-white shadow-pixel transition-transform ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}>Profile</button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full max-w-xs mx-auto mt-2">
                  <button onClick={startGame} disabled={isProcessing} className={`border-2 border-white bg-primary px-4 py-2 text-sm font-black uppercase text-black shadow-pixel transition-transform ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}>{isProcessing ? 'Loading...' : 'Retry'}</button>
                  {!hasRevived && <button onClick={watchAd} disabled={isProcessing} className={`border-2 border-white bg-blue-500 px-4 py-2 text-xs font-black uppercase text-white shadow-pixel transition-transform ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}>{isProcessing ? 'Loading...' : 'Watch Ads to Continue'}</button>}
                  <button onClick={connectWallet} disabled={isProcessing} className={`border-2 border-white bg-green-500 px-4 py-2 text-sm font-black uppercase text-white shadow-pixel transition-transform ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}>{isProcessing ? 'Loading...' : 'Connect Wallet'}</button>
                  <button onClick={handleGoHomeFromGameOver} disabled={isProcessing} className={`border-2 border-white bg-gray-600 px-4 py-2 text-sm font-black uppercase text-white shadow-pixel transition-transform ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}>Home</button>
                </div>
              )}
              {status && <div className="mt-2 text-xs text-yellow-500">{status}</div>}
            </div>
          </div>
        )}
      </div>

      {showNoWalletWarning && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white border-8 border-primary p-8 max-w-md w-full text-center pixel-shadow relative text-secondary">
            <h2 className="text-3xl font-black uppercase mb-4 text-red-600">Points Unsaved!</h2>
            <p className="text-xs font-bold uppercase text-gray-500 mb-8 leading-relaxed">
              Your wallet is not connected. If you play now, your game scores will not be recorded on the leaderboards.
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={async () => {
                  setShowNoWalletWarning(false);
                  await connectWallet();
                }} 
                className="w-full bg-primary text-secondary py-4 text-sm font-black uppercase border-4 border-secondary pixel-shadow hover:scale-105 active:translate-y-1 transition-all"
              >
                Connect Wallet
              </button>
              <button 
                onClick={() => {
                  setShowNoWalletWarning(false);
                  startGame();
                }} 
                className="w-full bg-gray-200 text-secondary py-4 text-sm font-black uppercase border-4 border-gray-400 pixel-shadow hover:scale-105 active:translate-y-1 transition-all"
              >
                Play Anyway
              </button>
            </div>
          </div>
        </div>
      )}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white border-8 border-primary p-8 max-w-sm w-full text-center pixel-shadow relative text-secondary">
            <h2 className="text-3xl font-black uppercase mb-4 text-red-600">Lose Progress?</h2>
            <p className="text-xs font-bold uppercase text-gray-500 mb-8 leading-relaxed">
              Your wallet is not connected. Leaving now will permanently discard your game progress.
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => {
                  setShowExitConfirm(false);
                  setGameState('START');
                  setCurrentView('LANDING');
                }} 
                className="w-full bg-red-600 text-white py-4 text-sm font-black uppercase border-4 border-black pixel-shadow hover:scale-105 active:translate-y-1 transition-all"
              >
                Yes, Discard Score
              </button>
              <button 
                onClick={() => setShowExitConfirm(false)} 
                className="w-full bg-gray-200 text-secondary py-4 text-sm font-black uppercase border-4 border-gray-400 pixel-shadow hover:scale-105 active:translate-y-1 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showVerifyAndSyncModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white border-8 border-primary p-8 max-w-md w-full text-center pixel-shadow relative text-secondary">
            <h2 className="text-3xl font-black uppercase mb-4 text-primary">Sync Progress</h2>
            <p className="text-xs font-bold uppercase text-gray-500 mb-8 leading-relaxed">
              Please complete the verification transaction or signature to save your score and coins to your profile!
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleVerifyAndSync} 
                className="w-full bg-primary text-secondary py-4 text-sm font-black uppercase border-4 border-secondary pixel-shadow hover:scale-105 active:translate-y-1 transition-all"
              >
                Verify & Sync Progress
              </button>
              <button 
                onClick={() => {
                  setShowVerifyAndSyncModal(false);
                  setPendingUnconnectedRun(false);
                }} 
                className="w-full bg-gray-200 text-secondary py-4 text-sm font-black uppercase border-4 border-gray-400 pixel-shadow hover:scale-105 active:translate-y-1 transition-all"
              >
                Discard Score
              </button>
            </div>
          </div>
        </div>
      )}
    </OrientationOverlay>
  );
}

export default App;
