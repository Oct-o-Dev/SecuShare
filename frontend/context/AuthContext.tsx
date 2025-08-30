// context/AuthContext.tsx
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  signup: (details: any) => Promise<void>;
  verifyOtp: (details: { email: string; otp: string }) => Promise<void>; // Add this
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const signup = async (details: any) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register', details);
      console.log('Signup successful:', res.data);
      // Pass email to verify page via query params for convenience
      router.push(`/verify?email=${encodeURIComponent(details.email)}`);
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // NEW FUNCTION
  const verifyOtp = async (details: { email: string; otp: string }) => {
    try {
        setLoading(true);
        await api.post('/auth/verify-otp', details);
        console.log('OTP Verification successful');
        // Redirect to login page after successful verification
        router.push('/login');
    } catch (error) {
        console.error('OTP Verification failed:', error);
        // You can add an error state here to show a message like "Invalid OTP"
    } finally {
        setLoading(false);
    }
  };


  const login = async (credentials: any) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', credentials);
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, verifyOtp, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};