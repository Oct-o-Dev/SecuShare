// app/verify/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function VerifyPage() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const { verifyOtp, loading } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get email from the URL query parameter
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        alert("Email not found. Please sign up again.");
        return;
    }
    await verifyOtp({ email, otp });
  };

  return (
    <div className="container mx-auto px-4 flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md bg-navy-blue p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-bold text-soft-beige mb-2">Verify Your Account</h2>
        <p className="text-light-blue mb-6">
          An OTP has been sent to <strong>{email}</strong>. Please enter it below.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="text-center tracking-[0.5em]"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      </div>
    </div>
  );
}