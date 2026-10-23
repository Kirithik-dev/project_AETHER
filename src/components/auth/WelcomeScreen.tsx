/**
 * Authenticated Confirmation Screen with Cinematic Dashboard Transition
 * Features:
 * - Displays user session details with existing architectural aesthetic
 * - Smoothly transitions into the main black hole workspace after ~1.8 seconds
 * - Immediate "ENTER WORKSPACE NOW" bypass button
 * - Proper cleanup of timers and animation state
 */

import React, { useState, useEffect, useRef } from 'react';
import { LogOut, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { User } from '../../lib/firebase';

interface WelcomeScreenProps {
  user: User;
  onSignOut: () => Promise<void>;
  onEnterWorkspace: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  user,
  onSignOut,
  onEnterWorkspace,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  const email = user.email || 'authenticated-session';
  const providerId = user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email/Password';

  // Automatically begin transition after 1.8 seconds
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      handleProceed();
    }, 1800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const handleProceed = () => {
    if (isFadingOut) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsFadingOut(true);

    transitionTimerRef.current = setTimeout(() => {
      onEnterWorkspace();
    }, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-20 flex flex-col items-center justify-center p-6 select-none transition-all duration-700 ease-out ${
        isFadingOut
          ? 'opacity-0 scale-105 pointer-events-none blur-sm'
          : 'opacity-100 scale-100 animate-[fadeIn_0.8s_ease-out]'
      }`}
      role="region"
      aria-label="Authenticated Welcome Screen"
    >
      {/* Radial soft shadow behind typography for legibility */}
      <div className="absolute w-[720px] h-[400px] bg-black/75 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Session Security Indicator */}
      <div className="mb-4 flex items-center gap-2.5 text-[11px] font-mono tracking-[0.3em] text-white/70 uppercase">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>AUTHENTICATED // SECURE SESSION</span>
      </div>

      {/* Main Cinematic Greeting */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extralight text-white tracking-[0.25em] font-sans uppercase text-center drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]">
        WELCOME BACK
      </h1>

      {/* User Display Name */}
      <div className="mt-3 text-xl sm:text-2xl font-light text-white/90 tracking-[0.18em] font-sans text-center">
        {displayName}
      </div>

      {/* Email & Provider Details */}
      <div className="mt-5 flex items-center gap-3 px-4 py-2 bg-white/[0.04] border border-white/15 text-xs font-mono text-white/70">
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-white/50" />
          <span>{email}</span>
        </div>
        <span className="w-1 h-1 bg-white/30 rounded-full" />
        <span className="text-[10px] text-white/40 tracking-wider uppercase">
          {providerId}
        </span>
      </div>

      {/* Action Controls & Countdown Indicator */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={handleProceed}
          className="px-8 py-3 bg-white text-black hover:bg-neutral-200 active:bg-neutral-300 text-xs font-mono font-medium tracking-widest uppercase transition-all flex items-center gap-2.5 cursor-pointer shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
        >
          <span>ENTER WORKSPACE</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/40 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>INITIALIZING RELATIVISTIC WORKSPACE...</span>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="mt-2 text-[11px] font-mono text-white/40 hover:text-white/80 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          <span>SIGN OUT</span>
        </button>
      </div>
    </div>
  );
};
