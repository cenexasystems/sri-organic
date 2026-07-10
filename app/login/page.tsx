"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Leaf, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const { signInWithGoogle, signInWithMagicLink, signOut, loading, error, message, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/cart');
    }
  }, [user, router]);

  if (user) {
    return <div className="min-h-screen bg-[#FAF9F5]" />; // blank while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F5] text-[#1B3022] font-body relative overflow-hidden selection:bg-[#1B3022]/20 p-6">
      
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#1B3022]/10 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white p-10 sm:p-12 rounded-[2.5rem] border border-outline-variant/30 shadow-2xl relative z-10 flex flex-col items-center text-center"
      >
        <button 
          onClick={() => router.push('/')}
          className="absolute top-8 left-8 text-[#6B7280] hover:text-[#1B3022] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="mb-6 flex justify-center w-full">
          <img src="/logo.png" alt="Sri Organic" className="h-16 w-auto object-contain mix-blend-multiply" />
        </div>
        
        <h1 className="font-display text-4xl font-bold tracking-tight text-[#1B3022] mb-3">
          Welcome Back
        </h1>
        <p className="text-[#6B7280] text-sm mb-8 leading-relaxed">
          Sign in to access your member portal, track orders, and view your personalized botanical formulas.
        </p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 text-sm py-3 px-4 rounded-xl mb-6 text-left border border-red-100">
            {error}
          </div>
        )}
        
        {message && (
          <div className="w-full bg-green-50 text-green-800 text-sm py-3 px-4 rounded-xl mb-6 text-left border border-green-100">
            {message}
          </div>
        )}

        {/* Google Login Button */}
        <button 
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full bg-white border border-outline-variant hover:border-[#1B3022] text-[#1B3022] font-body text-sm font-bold tracking-wide py-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Continue with Google
        </button>
        
        <div className="flex items-center w-full my-8">
          <div className="flex-1 border-t border-outline-variant/30"></div>
          <span className="px-4 text-xs text-[#6B7280] uppercase tracking-widest font-bold">Or</span>
          <div className="flex-1 border-t border-outline-variant/30"></div>
        </div>

        <div className="w-full space-y-4">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full bg-white border border-outline-variant text-[#1B3022] placeholder:text-[#6B7280] font-body text-sm py-4 px-5 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B3022]/20 focus:border-[#1B3022] transition-all duration-300 disabled:opacity-70 disabled:bg-gray-50"
          />
          <button 
            onClick={() => signInWithMagicLink(email)}
            disabled={loading || !email}
            className="w-full bg-[#1B3022] text-[#FAF9F5] font-body text-sm font-bold tracking-widest uppercase py-4 rounded-xl shadow-lg hover:bg-[#0C1510] hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Continue with Email
          </button>
        </div>
        
        <p className="mt-8 text-xs text-[#6B7280]">
          By continuing, you agree to our <a href="#" className="underline hover:text-[#1B3022]">Terms of Service</a> and <a href="#" className="underline hover:text-[#1B3022]">Privacy Policy</a>.
        </p>

      </motion.div>

      {/* Simple Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-[#6B7280] uppercase tracking-widest px-4">
        &copy; 2026 Sri Organic. All rights reserved.<br className="md:hidden" /> <span className="hidden md:inline"> | </span>Powered by Cenexa System
      </div>
    </div>
  );
}
