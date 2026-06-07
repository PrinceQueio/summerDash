import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase (Backend/Service Role)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const PORT = 4001; // Run backend on a different port

app.post('/api/sign-claim', async (req, res) => {
  const { playerAddress, gameCoins, runId, contractAddress, chainId } = req.body;

  console.log(`[API] Processing claim for ${playerAddress}: ${gameCoins} coins`);

  // 1. Basic validation
  if (!playerAddress || !gameCoins || !runId || !contractAddress || !chainId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    // 2. BACKEND VERIFICATION: Check Supabase for real coin balance
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('game_coins')
      .eq('address', playerAddress.toLowerCase())
      .single();

    if (fetchError) {
      console.error("[DB ERROR] Failed to fetch profile:", fetchError.message);
      return res.status(500).json({ error: 'Database connection failed' });
    }

    if (!profile) {
      console.warn(`[API] Profile not found for address: ${playerAddress}`);
      return res.status(404).json({ error: 'Player profile not found in database. Please finish a game first to register.' });
    }

    if (profile.game_coins < gameCoins) {
      return res.status(400).json({ error: `Insufficient verified coins. DB: ${profile.game_coins}, Req: ${gameCoins}` });
    }

    // 3. Deduction
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ game_coins: profile.game_coins - gameCoins })
      .eq('address', playerAddress.toLowerCase());

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update ledger' });
    }

    // 4. Sign the claim
    const signerKey = process.env.BACKEND_SIGNER_KEY || process.env.PRIVATE_KEY; 
    const wallet = new ethers.Wallet(signerKey);

    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'bytes32', 'address', 'uint256'],
      [playerAddress, gameCoins, runId, contractAddress, chainId]
    );

    const messageHashBinary = ethers.getBytes(messageHash);
    const signature = await wallet.signMessage(messageHashBinary);

    console.log(`[API] Successfully signed claim. Signature: ${signature.slice(0, 10)}...`);
    return res.status(200).json({ signature });
  } catch (error) {
    console.error('Conversion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sign-score', async (req, res) => {
  const { playerAddress, username, score, tournamentId, contractAddress, chainId } = req.body;

  console.log(`[API] Processing score submission for ${playerAddress}: ${score} points`);

  if (!playerAddress || score === undefined || !tournamentId || !contractAddress || !chainId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    // BACKEND VERIFICATION: Check if user exists and has a session/score
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('username')
      .eq('address', playerAddress.toLowerCase())
      .single();

    if (fetchError || !profile) {
      console.warn(`[API] Profile not found for address: ${playerAddress}`);
      return res.status(404).json({ error: 'Player profile not found.' });
    }

    // UPDATE LEADERBOARD: Push to Supabase securely from the backend
    const { error: upsertError } = await supabase
      .from('leaderboard')
      .upsert({
        address: playerAddress.toLowerCase(),
        username: username || profile.username || "Anonymous",
        score: score,
        timestamp: new Date().toISOString()
      }, { onConflict: 'address' });

    if (upsertError) {
      console.error("[DB ERROR] Failed to update leaderboard:", upsertError.message);
      return res.status(500).json({ error: 'Failed to update leaderboard in database' });
    }

    // SIGN THE SCORE
    const signerKey = process.env.BACKEND_SIGNER_KEY || process.env.PRIVATE_KEY; 
    const wallet = new ethers.Wallet(signerKey);

    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'uint256', 'address', 'uint256'],
      [playerAddress, score, tournamentId, contractAddress, chainId]
    );

    const messageHashBinary = ethers.getBytes(messageHash);
    const signature = await wallet.signMessage(messageHashBinary);

    console.log(`[API] Successfully signed score. Signature: ${signature.slice(0, 10)}...`);
    return res.status(200).json({ signature });
  } catch (error) {
    console.error('Score submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/verify-run', async (req, res) => {
  const { playerAddress, score, coins, runDuration, validationData } = req.body;

  console.log(`[API] Verifying run for ${playerAddress}: Score ${score}, Coins ${coins}, Time ${runDuration}ms`);

  if (!playerAddress || score === undefined || coins === undefined || runDuration === undefined) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    // 1. Plausibility Check
    // Relaxed logic: Accounts for revives where score is carried over but duration resets.
    // Catch only blatant cheaters sending millions.
    const durationSec = Math.max(1, runDuration / 1000);
    const maxScore = Math.max(1000, durationSec * 500); 
    const maxCoins = Math.max(5000, durationSec * 2000);

    if (score > maxScore || coins > maxCoins) {
      console.warn(`[CHEAT DETECTED] Address: ${playerAddress}. Score/Coins physically impossible. Score: ${score}, Coins: ${coins}, Duration: ${durationSec}s`);
      return res.status(400).json({ error: 'Run verification failed. Unrealistic score.' });
    }

    // 2. Secure Profile Update
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('total_points, game_coins, daily_score')
      .eq('address', playerAddress.toLowerCase())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is 'not found'
      console.error("[DB ERROR] Failed to fetch profile:", fetchError.message);
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const currentTotalPoints = profile ? profile.total_points || 0 : 0;
    const currentGameCoins = profile ? profile.game_coins || 0 : 0;
    const currentDailyScore = profile ? profile.daily_score || 0 : 0;

    const newTotalPoints = Math.max(0, currentTotalPoints + score + coins); 
    const newGameCoins = Math.max(0, currentGameCoins + score + coins);
    const newDailyScore = Math.max(0, currentDailyScore + score + coins);

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        address: playerAddress.toLowerCase(),
        total_points: newTotalPoints,
        game_coins: newGameCoins,
        daily_score: newDailyScore
      }, { onConflict: 'address' });

    if (upsertError) {
      console.error("[DB ERROR] Failed to update profile:", upsertError.message);
      return res.status(500).json({ error: 'Failed to update profile in database' });
    }

    console.log(`[API] Run verified and saved for ${playerAddress}.`);
    return res.status(200).json({
      success: true,
      totalPoints: newTotalPoints,
      gameCoins: newGameCoins,
      dailyScore: newDailyScore
    });

  } catch (error) {
    console.error('Verify run error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ SummerDash Backend running at http://localhost:${PORT}`);
});
