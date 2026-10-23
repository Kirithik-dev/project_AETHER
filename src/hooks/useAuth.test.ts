import test from 'node:test';
import assert from 'node:assert/strict';
import { formatAuthError } from './useAuth';

test('formatAuthError maps known Firebase error codes to friendly messages', () => {
  assert.equal(
    formatAuthError('auth/invalid-credential'),
    'Incorrect email or password. Please verify your credentials.'
  );
  assert.equal(
    formatAuthError('auth/email-already-in-use'),
    'An account already exists with this email address.'
  );
  assert.equal(
    formatAuthError('auth/weak-password'),
    'Password is too weak. Please use at least 6 characters.'
  );
  assert.equal(
    formatAuthError('auth/popup-closed-by-user'),
    'Google sign-in was cancelled.'
  );
  assert.equal(
    formatAuthError('auth/popup-blocked'),
    'The sign-in popup was blocked by your browser. Please allow popups for this site.'
  );
  assert.equal(
    formatAuthError('auth/timeout'),
    'Authentication request timed out. Please check your connection and try again.'
  );
  assert.equal(
    formatAuthError('auth/operation-not-allowed'),
    'This sign-in provider is not enabled in Firebase Console. Please enable Email/Password or Google in Authentication > Sign-in method.'
  );
  assert.equal(
    formatAuthError('auth/unauthorized-domain'),
    'This domain is not authorized in Firebase Console. Please add this domain to Authentication > Settings > Authorized domains.'
  );
  assert.equal(
    formatAuthError('unconfigured'),
    'Authentication service is initializing. Please try again in a moment.'
  );
});

test('formatAuthError returns fallback for unknown errors', () => {
  assert.equal(
    formatAuthError('auth/unknown-error', 'Custom fallback message'),
    'Custom fallback message'
  );
});
