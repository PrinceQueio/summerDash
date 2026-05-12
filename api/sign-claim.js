import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (Backend/Service Role)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { playerAddress, gameCoins, runId, contractAddress, chainId } = req.body;

  // 1. Basic validation
  if (!playerAddress || !gameCoins || !runId || !contractAddress || !chainId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // 2. BACKEND VERIFICATION: Check Supabase for real coin balance
  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('game_coins')
      .eq('address', playerAddress.toLowerCase())
      .single();

    if (fetchError || !profile) {
      return res.status(404).json({ error: 'Player profile not found in database' });
    }

    if (profile.game_coins < gameCoins) {
      return res.status(400).json({ error: `Insufficient verified coins. DB: ${profile.game_coins}, Req: ${gameCoins}` });
    }

    // 3. Deduction (Optional: You could do this after the contract call, but for security we deduct now)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ game_coins: profile.game_coins - gameCoins })
      .eq('address', playerAddress.toLowerCase());

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update ledger' });
    }

    // 4. Sign the claim
    const signerKey = process.env.PRIVATE_KEY; // Using the key from .env
    const wallet = new ethers.Wallet(signerKey);

    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'bytes32', 'address', 'uint256'],
      [playerAddress, gameCoins, runId, contractAddress, chainId]
    );

    const messageHashBinary = ethers.getBytes(messageHash);
    const signature = await wallet.signMessage(messageHashBinary);

    return res.status(200).json({ signature });
  } catch (error) {
    console.error('Conversion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
