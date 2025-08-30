// app/signup/page.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Import the hook
import Button from '@/components/Button';
import Input from '@/components/Input';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, loading } = useAuth(); // Use the signup function from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup({ name, email, password });
  };

  return (
    <div className="container mx-auto px-4 flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md bg-navy-blue p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-soft-beige mb-6">Create an Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... Inputs are the same ... */}
          <Input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        <p className="text-center text-soft-beige mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-light-blue hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}