import { supabase } from './utils/supabase';

async function testConnection() {
  const { data, error } = await supabase.from('orders').select('*');
  
  if (error) {
    console.error('❌ Supabase connection failed:', error.message);
  } else {
    console.log('✅ Supabase connected! Orders:', data);
  }
}

testConnection();