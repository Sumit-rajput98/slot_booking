import { supabase } from '../supabaseClient';
import http from './http';

export const fetchProfile = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  if (!token) throw new Error('Not authenticated');

  const res = await http.get('/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
