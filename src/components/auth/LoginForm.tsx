/**
 * Cinematic Authentication Interface
 * Monochromatic, architectural typography, and real modular Firebase Authentication.
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AuthViewMode } from '../../types/auth';

interface LoginFormProps {
  onSignIn: (email: string, pass: string) => Promise<void>;
  onSignUp: (email: string, pass: string, name?: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  isConfigured?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSignIn,
  onSignUp,
  onGoogleSignIn,
  onPasswordReset,
  isLoading,
  error,
  clearError,
}) => {
  const [mode, setMode] = useState<AuthViewMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent duplicate submissions

    clearError();
    setValidationError(null);

    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot_password') {
      try {
        await onPasswordReset(email.trim());
        setResetSent(true);
      } catch {
        // Handled via error state in useAuth
      }
      return;
    }

    if (!password.trim() || password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    try {
      if (mode === 'signup') {
        await onSignUp(email.trim(), password, displayName.trim() || undefined);
      } else {
        await onSignIn(email.trim(), password);
      }
    } catch {
      // Handled via error state in useAuth
    }
  };

  const handleGoogleClick = async () => {
    if (isLoading) return; // Prevent duplicate submissions
    clearError();
    setValidationError(null);
    try {
      await onGoogleSignIn();
    } catch {
      // Handled via error state in useAuth
    }
  };

  const currentError = validationError || error;

  return (
    <div className="relative z-10 w-full max-w-md p-7 sm:p-9 md:p-10 bg-[#050608]/85 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] select-none">
      {/* Brand Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-6 h-6 border border-white/60 flex items-center justify-center font-mono text-[10px] tracking-widest text-white/90">
            AE
          </div>
          <span className="font-mono text-xs tracking-[0.25em] text-white/90 uppercase font-semibold">
            AETHER
          </span>
        </div>

        {mode === 'forgot_password' ? (
          <div>
            <h1 className="text-2xl font-light tracking-tight text-white mb-2 font-sans">
              Reset Password
            </h1>
            <p className="text-xs text-white/50 leading-relaxed font-sans">
              Enter your registered email address to receive secure recovery instructions.
            </p>
          </div>
        ) : mode === 'signup' ? (
          <div>
            <h1 className="text-2xl font-light tracking-tight text-white mb-2 font-sans">
              Create an account
            </h1>
            <p className="text-xs text-white/50 leading-relaxed font-sans">
              Initialize your secure personal account.
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-light tracking-tight text-white mb-2 font-sans">
              Welcome back
            </h1>
            <p className="text-xs text-white/50 leading-relaxed font-sans">
              Sign in to your private environment via secure authentication.
            </p>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {currentError && (
        <div
          role="alert"
          className="mb-5 p-3 bg-red-950/40 border-l-2 border-red-500 text-xs text-red-200 font-mono tracking-wide flex items-start gap-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 flex-shrink-0" />
          <span className="leading-relaxed">{currentError}</span>
        </div>
      )}

      {/* Password Reset Confirmation */}
      {resetSent && (
        <div className="mb-5 p-4 bg-white/5 border border-white/20 text-xs text-white/80 font-sans space-y-2">
          <div className="flex items-center gap-2 text-white font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Reset email dispatched</span>
          </div>
          <p className="text-white/60 text-[11px] leading-relaxed">
            Check your inbox for a secure link to reset your password.
          </p>
          <button
            type="button"
            onClick={() => {
              setResetSent(false);
              setMode('signin');
              clearError();
            }}
            className="text-xs text-white underline underline-offset-4 hover:text-white/80 pt-1 cursor-pointer"
          >
            Back to sign in
          </button>
        </div>
      )}

      {/* Form Content */}
      {!resetSent && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Google Sign-in Button */}
          {mode !== 'forgot_password' && (
            <>
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                aria-label="Continue with Google"
                className="w-full h-11 flex items-center justify-center gap-3 border border-white/20 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/90 text-xs tracking-wider font-mono transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>CONTINUE WITH GOOGLE</span>
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative px-3 bg-[#06080c] text-[10px] font-mono tracking-widest text-white/40 uppercase">
                  OR ENTER CREDENTIALS
                </div>
              </div>
            </>
          )}

          {/* Full Name field (Signup only) */}
          {mode === 'signup' && (
            <div>
              <label
                htmlFor="signup-name"
                className="block text-[11px] font-mono text-white/70 uppercase tracking-widest mb-1.5"
              >
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Alexander Vance"
                disabled={isLoading}
                className="w-full h-11 px-3.5 bg-black/40 border border-white/15 focus:border-white/60 focus:outline-none text-white text-xs font-mono tracking-wide placeholder:text-white/20 transition-colors disabled:opacity-50"
              />
            </div>
          )}

          {/* Email field */}
          <div>
            <label
              htmlFor="auth-email"
              className="block text-[11px] font-mono text-white/70 uppercase tracking-widest mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="name@domain.com"
                disabled={isLoading}
                className="w-full h-11 pl-9 pr-3.5 bg-black/40 border border-white/15 focus:border-white/60 focus:outline-none text-white text-xs font-mono tracking-wide placeholder:text-white/20 transition-colors disabled:opacity-50"
              />
              <Mail className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Password field */}
          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="auth-password"
                  className="block text-[11px] font-mono text-white/70 uppercase tracking-widest"
                >
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      setValidationError(null);
                      setMode('forgot_password');
                    }}
                    className="text-[11px] font-sans text-white/50 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className="w-full h-11 pl-9 pr-10 bg-black/40 border border-white/15 focus:border-white/60 focus:outline-none text-white text-xs font-mono tracking-wide placeholder:text-white/20 transition-colors disabled:opacity-50"
                />
                <Lock className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-3 text-white/40 hover:text-white/80 p-0.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 bg-white text-black hover:bg-neutral-200 active:bg-neutral-300 text-xs font-mono font-medium tracking-widest uppercase transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>AUTHENTICATING...</span>
              </span>
            ) : mode === 'forgot_password' ? (
              <span>SEND RECOVERY LINK</span>
            ) : mode === 'signup' ? (
              <span className="flex items-center gap-2">
                <span>CREATE ACCOUNT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>SIGN IN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </button>

          {/* Switch Mode Links */}
          <div className="pt-2 text-center text-xs font-sans text-white/50">
            {mode === 'signin' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    clearError();
                    setValidationError(null);
                    setMode('signup');
                  }}
                  className="text-white hover:underline underline-offset-2 font-medium cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  clearError();
                  setValidationError(null);
                  setMode('signin');
                }}
                className="text-white hover:underline underline-offset-2 font-medium cursor-pointer"
              >
                Already have an account? Sign in
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
