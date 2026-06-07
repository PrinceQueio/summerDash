import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkUserLeaderboard() {
  const address = '0x85d4828cc9766b6d3c373e4b8eb35a11eb7ae1c3';
  const { data: byAddress, error: err1 } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('address', address.toLowerCase());

  const { data: byUsername, error: err2 } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('username', 'Sky_6691');

  console.log('Leaderboard by address:', byAddress, err1);
  console.log('Leaderboard by username:', byUsername, err2);
}

checkUserLeaderboard().catch(console.error);
