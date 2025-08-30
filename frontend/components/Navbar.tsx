// components/Navbar.tsx
"use client";

import Link from 'next/link';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { token, logout } = useAuth();

  return (
    <nav className="bg-dark-blue/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 border-b border-navy-blue">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-light-blue">
              SecuShare
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {token ? (
              // Authenticated User Links
              <>
                <Link href="/dashboard" className="text-soft-beige hover:text-light-blue transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="bg-light-blue text-dark-blue hover:bg-opacity-90 transition-colors px-4 py-2 rounded-md text-sm font-bold"
                >
                  Logout
                </button>
              </>
            ) : (
              // Guest Links
              <>
                <Link href="/login" className="text-soft-beige hover:text-light-blue transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link href="/signup" className="bg-light-blue text-dark-blue hover:bg-opacity-90 transition-colors px-4 py-2 rounded-md text-sm font-bold">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;