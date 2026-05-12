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

app.listen(PORT, () => {
  console.log(`✅ SummerDash Backend running at http://localhost:${PORT}`);
});
