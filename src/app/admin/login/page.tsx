'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { Loader2, Lock, Mail } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      showToast('Welcome back, Chef!', 'success');
      // Refresh router to trigger middleware state changes
      router.refresh();
      router.push('/admin');
    } catch (error: any) {
      console.error('Login error:', error);
      showToast(error.message || 'Invalid credentials. Please check and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-brand-cream flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-md bg-white border-2 border-brand-brown rounded-[32px] shadow-2xl p-8 md:p-10 relative overflow-hidden">
        
        {/* Soft background shape */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-rose/10 rounded-full translate-x-8 -translate-y-8 select-none pointer-events-none" />

        <div className="text-center mb-8">
          <span className="text-5xl">🧁</span>
          <h2 className="text-3xl font-serif font-black text-brand-brown mt-4">
            Chef's Entrance
          </h2>
          <p className="text-sm text-brand-brown/60 mt-1.5 font-medium">
            Manage your Bake & Joy storefront
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown/85 mb-1.5">
              Email Address
            </label>
            <div className="relative flex rounded-xl border border-brand-brown/15 focus-within:border-brand-amber bg-brand-cream/10 overflow-hidden transition-colors">
              <span className="flex items-center justify-center px-4 text-brand-brown/40 border-r border-brand-brown/5">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="chef@bakenjoy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm text-brand-brown focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown/85 mb-1.5">
              Password
            </label>
            <div className="relative flex rounded-xl border border-brand-brown/15 focus-within:border-brand-amber bg-brand-cream/10 overflow-hidden transition-colors">
              <span className="flex items-center justify-center px-4 text-brand-brown/40 border-r border-brand-brown/5">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm text-brand-brown focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-brown hover:bg-brand-amber text-brand-cream py-4 rounded-xl font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : (
              'Enter Dashboard'
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-brand-brown/5 pt-6">
          <a
            href="/"
            className="text-xs font-bold text-brand-brown/55 hover:text-brand-amber transition-colors"
          >
            &larr; Back to Public Shop
          </a>
        </div>
      </div>
    </div>
  );
}
