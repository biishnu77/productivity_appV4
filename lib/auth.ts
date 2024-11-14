import { createHash } from 'crypto';
import { supabase } from './supabase';

// Simple password hashing (in production, use bcrypt or similar)
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function registerUser(username: string, email: string, password: string) {
  const hashedPassword = hashPassword(password);
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, email, password_hash: hashedPassword }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      if (error.message.includes('username')) {
        throw new Error('Username already exists');
      }
      if (error.message.includes('email')) {
        throw new Error('Email already exists');
      }
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

export async function verifyUserIdentity(username: string, email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('email', email)
    .single();

  if (error || !data) {
    throw new Error('Invalid username or email combination');
  }

  return data;
}

export async function resetPassword(username: string, email: string, newPassword: string) {
  // First verify the user exists with the given username and email
  await verifyUserIdentity(username, email);
  
  const hashedPassword = hashPassword(newPassword);
  
  // Update the password_hash in the users table
  const { error } = await supabase
    .from('users')
    .update({ password_hash: hashedPassword })
    .match({ username, email });

  if (error) {
    console.error('Password reset error:', error);
    throw new Error('Failed to reset password');
  }
}
