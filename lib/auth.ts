// lib/auth.tsx
import { createHash } from 'crypto';
import { supabase } from './supabase'; // Make sure path is correct

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
    console.error("Registration error:", error); // Log for debugging
    throw new Error('Registration failed. Please try again.'); // User-friendly message
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

  if (error) {
    console.error("Login error:", error);
    throw new Error('Login failed. Please try again.');
  }

  if (!data) {
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

  if (error) {
    console.error("Verification error:", error);
    throw new Error('Verification failed. Please try again.');
  }

  if (!data) {
    throw new Error('Invalid username or email combination');
  }

  return data;
}

export async function resetPassword(username: string, email: string, newPassword: string) {
  try {
    await verifyUserIdentity(username, email); // Verify before reset
  } catch (verificationError) {
    console.error("Verification failed before reset:", verificationError);
    throw verificationError; // Re-throw the verification error
  }


  const hashedPassword = hashPassword(newPassword);

  const { error } = await supabase
    .from('users')
    .update({ password_hash: hashedPassword })
    .match({ username, email });

  if (error) {
    console.error('Password reset error:', error);
    throw new Error('Failed to reset password. Please try again.');
  }
}
export async function getUsernameByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('username')
    .eq('email', email)
    .maybeSingle(); // Changed from .single()

  if (error) {
    console.error("Error fetching username:", error);
    throw new Error('Error fetching username. Please try again later.');
  }

  if (data) {
    const username = data.username;

    try {
      const res = await fetch('/api/send-username-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData?.message || `Failed to send email. Status: ${res.status}`;
        throw new Error(errorMessage);
      }

      return username;

    } catch (emailError) {
      console.error("Email sending error:", emailError);
      throw new Error('Failed to send email. Please try again later.');
    }

  } else {
    // Email not found - silent exit to avoid info disclosure
    return;
  }
}