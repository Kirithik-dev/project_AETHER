/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SculptureCanvas, ScenePhase } from './components/sculpture/SculptureCanvas';
import { LoginForm } from './components/auth/LoginForm';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { DashboardView } from './components/dashboard/DashboardView';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const {
    user,
    loading,
    actionLoading,
    error,
    clearError,
    isConfigured,
    signIn,
    signUp,
    signInGoogle,
    sendResetEmail,
    logOut,
  } = useAuth();

  const [reducedMotion, setReducedMotion] = useState(false);
  const [dashboardActive, setDashboardActive] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('aether_workspace_entered') === 'true';
    } catch {
      return false;
    }
  });

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // When user signs in, if they previously entered the workspace, maintain it.
  // If user signs out, reset workspace state.
  useEffect(() => {
    if (!user) {
      setDashboardActive(false);
      try {
        sessionStorage.removeItem('aether_workspace_entered');
      } catch {
        // ignore
      }
    }
  }, [user]);

  const handleEnterWorkspace = () => {
    setDashboardActive(true);
    try {
      sessionStorage.setItem('aether_workspace_entered', 'true');
    } catch {
      // ignore
    }
  };

  const handleSignOut = async () => {
    try {
      sessionStorage.removeItem('aether_workspace_entered');
    } catch {
      // ignore
    }
    setDashboardActive(false);
    await logOut();
  };

  const phase: ScenePhase = user ? 'authenticated' : 'login';

  return (
    <div
      className="relative w-full min-h-screen bg-[#030407] text-white overflow-x-hidden font-sans select-none"
      data-testid="app-root"
      data-phase={phase}
    >
      {/* Initial Auth Session Loading */}
      {loading ? (
        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center font-mono text-xs text-white/50 tracking-widest uppercase">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
          <span>AUTHENTICATING...</span>
        </div>
      ) : user && dashboardActive ? (
        /* MAIN WORKSPACE DASHBOARD (Cinematic Black Hole + Tool Carousel) */
        <DashboardView
          user={user}
          onSignOut={handleSignOut}
          reducedMotion={reducedMotion}
        />
      ) : (
        /* AUTHENTICATION & WELCOME EXPERIENCE (Preserving 3D Particle Sculpture) */
        <>
          <SculptureCanvas
            phase={phase}
            reducedMotion={reducedMotion}
          />

          {user ? (
            /* Welcome screen with cinematic fade into workspace */
            <WelcomeScreen
              user={user}
              onSignOut={handleSignOut}
              onEnterWorkspace={handleEnterWorkspace}
            />
          ) : (
            /* Left-Flank Cinematic Authentication Panel */
            <div className="relative z-10 min-h-screen flex flex-col justify-center animate-[fadeIn_0.6s_ease-out]">
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex">
                <div className="w-full lg:w-1/2">
                  <LoginForm
                    onSignIn={signIn}
                    onSignUp={signUp}
                    onGoogleSignIn={signInGoogle}
                    onPasswordReset={sendResetEmail}
                    isLoading={actionLoading}
                    error={error}
                    clearError={clearError}
                    isConfigured={isConfigured}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
