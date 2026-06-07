import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { playerAddress, score, coins, runDuration, validationData } = req.body;

  if (!playerAddress || score === undefined || coins === undefined || runDuration === undefined) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const durationSec = Math.max(1, runDuration / 1000);
    const maxScore = Math.max(1000, durationSec * 500); 
    const maxCoins = Math.max(5000, durationSec * 2000);

    if (score > maxScore || coins > maxCoins) {
      return res.status(400).json({ error: 'Run verification failed. Unrealistic score.' });
    }

    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('total_points, game_coins, daily_score')
      .eq('address', playerAddress.toLowerCase())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
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
      return res.status(500).json({ error: 'Failed to update profile in database' });
    }

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
}
