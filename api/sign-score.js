import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { playerAddress, username, score, tournamentId, contractAddress, chainId } = req.body;

  if (!playerAddress || score === undefined || !tournamentId || !contractAddress || !chainId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('username')
      .eq('address', playerAddress.toLowerCase())
      .single();

    if (fetchError || !profile) {
      return res.status(404).json({ error: 'Player profile not found.' });
    }

    const { error: upsertError } = await supabase
      .from('leaderboard')
      .upsert({
        address: playerAddress.toLowerCase(),
        username: username || profile.username || "Anonymous",
        score: score,
        timestamp: new Date().toISOString()
      }, { onConflict: 'address' });

    if (upsertError) {
      return res.status(500).json({ error: 'Failed to update leaderboard in database' });
    }

    const signerKey = process.env.BACKEND_SIGNER_KEY || process.env.PRIVATE_KEY; 
    const wallet = new ethers.Wallet(signerKey);

    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'uint256', 'uint256', 'address', 'uint256'],
      [playerAddress, score, tournamentId, contractAddress, chainId]
    );

    const messageHashBinary = ethers.getBytes(messageHash);
    const signature = await wallet.signMessage(messageHashBinary);

    return res.status(200).json({ signature });
  } catch (error) {
    console.error('Score submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
