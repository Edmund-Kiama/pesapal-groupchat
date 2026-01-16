# Auth State Fix Plan

## Issue
Every time the user refreshes the page, they are redirected to the login page. This happens due to inconsistent auth state management between:
1. `useAuthStore` (Zustand persist with localStorage key `auth-storage`)
2. `useUserContext` (useSessionStorage with key `session-tokens`)

## Root Cause
The logout function in `auth-store.ts` only clears the Zustand store state but doesn't properly clear the persisted localStorage. Additionally, the auth guards check both `tokens` and `isAuthenticated` but there's no synchronization between the two stores.

## Fix Steps
1. ✅ Updated `auth-store.ts` to add a custom storage handler that properly handles SSR and clears persisted storage on logout
2. ✅ Updated `auth-guard.tsx` to handle hydration properly and wait for client-side mounting before checking auth state

## Files Modified
- `/home/ed/Desktop/coding/pesapal/frontend/src/lib/stores/auth-store.ts`
- `/home/ed/Desktop/coding/pesapal/frontend/src/components/providers/auth-guard.tsx`

## Status: COMPLETED ✅

