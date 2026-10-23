/**
 * React hook for Firebase Authentication state and operations.
 * Subscribes to onAuthStateChanged and handles email/password, Google OAuth, and password reset
 * with guaranteed timeout bounds, strict try/catch/finally handling, and non-sensitive logging.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from '../lib/firebase';

export function formatAuthError(errorCode: string, defaultMessage?: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/missing-password':
      return 'Please enter your password.';
    case 'auth/missing-email':
      return 'Please enter your email address.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in window was already open. Please try again.';
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled in Firebase Console. Please enable Email/Password or Google in Authentication > Sign-in method.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Console. Please add this domain to Authentication > Settings > Authorized domains.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to many failed attempts. Try again later or reset password.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    case 'auth/timeout':
      return 'Authentication request timed out. Please check your connection and try again.';
    case 'auth/requires-recent-login':
      return 'This action requires recent authentication. Please sign in again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email using a different sign-in method.';
    case 'unconfigured':
      return 'Authentication service is initializing. Please try again in a moment.';
    default:
      return defaultMessage || 'An unexpected authentication error occurred.';
  }
}

/**
 * Wraps an asynchronous auth operation with a hard timeout to prevent
 * the UI from becoming permanently stuck in loading state.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operationName: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        const timeoutErr: any = new Error(`${operationName} timed out after ${Math.round(timeoutMs / 1000)}s.`);
        timeoutErr.code = 'auth/timeout';
        reject(timeoutErr);
      }, timeoutMs);
    }),
  ]);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real onAuthStateChanged listener with fallback timeout and error handling
  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      console.warn('[Aether Auth] Firebase Auth not configured or unavailable.');
      setLoading(false);
      return;
    }

    // Safety timeout: ensure initial page load does not freeze if Firebase auth network call hangs
    const safetyTimeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn('[Aether Auth] Initial auth listener reached 3000ms timeout; mounting interface.');
          return false;
        }
        return false;
      });
    }, 3000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        clearTimeout(safetyTimeout);
        console.info('[Aether Auth] Session status:', currentUser ? `Authenticated (${currentUser.uid})` : 'No active session');
        setUser(currentUser);
        setLoading(false);
      },
      (listenerError) => {
        clearTimeout(safetyTimeout);
        const errCode = (listenerError as any)?.code || 'auth/unknown';
        console.error('[Aether Auth] onAuthStateChanged error:', errCode, listenerError.message);
        setError(formatAuthError(errCode, listenerError.message));
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const signIn = async (email: string, pass: string) => {
    if (actionLoading) return;
    setError(null);
    if (!auth || !isFirebaseConfigured) {
      const err = formatAuthError('unconfigured');
      setError(err);
      console.warn('[Aether Auth] Sign-in attempted while Firebase is unconfigured.');
      return;
    }

    console.info('[Aether Auth] Starting sign-in request...');
    setActionLoading(true);
    try {
      const userCredential = await withTimeout(
        signInWithEmailAndPassword(auth, email.trim(), pass),
        20000,
        'Email sign-in'
      );
      console.info('[Aether Auth] Sign-in succeeded for user:', userCredential.user.uid);
      setUser(userCredential.user);
    } catch (err: any) {
      const errorCode = err?.code || 'auth/unknown';
      console.error('[Aether Auth] Sign-in failed with code:', errorCode);
      const friendlyError = formatAuthError(errorCode, err?.message);
      setError(friendlyError);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, name?: string) => {
    if (actionLoading) return;
    setError(null);
    if (!auth || !isFirebaseConfigured) {
      const err = formatAuthError('unconfigured');
      setError(err);
      console.warn('[Aether Auth] Sign-up attempted while Firebase is unconfigured.');
      return;
    }

    console.info('[Aether Auth] Starting account registration...');
    setActionLoading(true);
    try {
      const userCredential = await withTimeout(
        createUserWithEmailAndPassword(auth, email.trim(), pass),
        20000,
        'Account registration'
      );
      console.info('[Aether Auth] Registration succeeded for user:', userCredential.user.uid);

      if (name && name.trim()) {
        try {
          await withTimeout(
            updateProfile(userCredential.user, { displayName: name.trim() }),
            8000,
            'Profile update'
          );
          console.info('[Aether Auth] Profile display name updated.');
        } catch (profileErr: any) {
          console.warn('[Aether Auth] Profile display name update error:', profileErr?.code || profileErr?.message);
        }
      }

      setUser({
        ...userCredential.user,
        displayName: name?.trim() || userCredential.user.displayName,
      });
    } catch (err: any) {
      const errorCode = err?.code || 'auth/unknown';
      console.error('[Aether Auth] Registration failed with code:', errorCode);
      const friendlyError = formatAuthError(errorCode, err?.message);
      setError(friendlyError);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const signInGoogle = async () => {
    if (actionLoading) return;
    setError(null);
    if (!auth || !googleProvider || !isFirebaseConfigured) {
      const err = formatAuthError('unconfigured');
      setError(err);
      console.warn('[Aether Auth] Google sign-in attempted while Firebase is unconfigured.');
      return;
    }

    console.info('[Aether Auth] Starting Google sign-in popup...');
    setActionLoading(true);
    try {
      const userCredential = await withTimeout(
        signInWithPopup(auth, googleProvider),
        45000,
        'Google sign-in'
      );
      console.info('[Aether Auth] Google sign-in succeeded for user:', userCredential.user.uid);
      setUser(userCredential.user);
    } catch (err: any) {
      const errorCode = err?.code || 'auth/unknown';
      console.error('[Aether Auth] Google sign-in failed with code:', errorCode);
      const friendlyError = formatAuthError(errorCode, err?.message);
      setError(friendlyError);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const sendResetEmail = async (email: string) => {
    if (actionLoading) return;
    setError(null);
    if (!auth || !isFirebaseConfigured) {
      const err = formatAuthError('unconfigured');
      setError(err);
      console.warn('[Aether Auth] Password reset attempted while Firebase is unconfigured.');
      return;
    }

    console.info('[Aether Auth] Dispatching password reset email...');
    setActionLoading(true);
    try {
      await withTimeout(
        sendPasswordResetEmail(auth, email.trim()),
        15000,
        'Password reset'
      );
      console.info('[Aether Auth] Password reset email successfully dispatched.');
    } catch (err: any) {
      const errorCode = err?.code || 'auth/unknown';
      console.error('[Aether Auth] Password reset failed with code:', errorCode);
      const friendlyError = formatAuthError(errorCode, err?.message);
      setError(friendlyError);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const logOut = async () => {
    setError(null);
    if (!auth) return;
    console.info('[Aether Auth] Signing out user...');
    try {
      await signOut(auth);
      setUser(null);
      console.info('[Aether Auth] Sign out completed.');
    } catch (err: any) {
      const errorCode = err?.code || 'auth/unknown';
      console.error('[Aether Auth] Sign out failed with code:', errorCode);
      setError(formatAuthError(errorCode, err?.message));
    }
  };

  return {
    user,
    loading,
    actionLoading,
    error,
    setError,
    clearError,
    isConfigured: isFirebaseConfigured,
    signIn,
    signUp,
    signInGoogle,
    sendResetEmail,
    logOut,
  };
}
