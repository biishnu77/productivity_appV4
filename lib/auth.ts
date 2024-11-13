import { createHash } from 'crypto';
import { supabase } from './supabase';

// Simple password hashing (in production, use bcrypt or similar)
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function registerUser(username: string, password: string) {
  const hashedPassword = hashPassword(password);
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, password_hash: hashedPassword }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Username already exists');
    }
    throw error;
  }

  return data;
}

export async function loginUser(username: string, password: string) {
  const hashedPassword = hashPassword(password);
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password_hash', hashedPassword)
    .single();

  if (error || !data) {
    throw new Error('Invalid username or password');
  }

  return data;
}