# React 19 useActionState Refactoring

**Status:** ✅ COMPLETED
**Date:** 2026-01-20

## Overview

Refactored authentication forms to use React 19's `useActionState` hook, eliminating redundant state management and improving code quality with better patterns.

## Changes Made

### 1. Server Actions (`lib/actions/auth.ts`)

**Before:**
```ts
export async function login(email: string, password: string) {
  // Direct parameters
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  redirect('/pos')
}
```

**After:**
```ts
export type AuthState = { error?: string; success?: string }

export async function loginAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  // ... validation and auth logic
}
```

**Key Changes:**
- Renamed: `login` → `loginAction`, `signup` → `signupAction`, `logout` → `logoutAction`
- Added `prevState: AuthState` parameter (required by `useActionState`)
- Changed to accept `FormData` instead of individual parameters
- Moved validation logic to server (password matching, length checks)
- Returns `AuthState` with error/success messages

### 2. Login/Signup Pages

**Before:**
```tsx
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState('')
const { signIn, isLoading } = useAuth()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await signIn(email, password)
  } catch (err) {
    setError(err.message)
  }
}

<form onSubmit={handleSubmit}>
  <input value={email} onChange={(e) => setEmail(e.target.value)} />
  <button disabled={isLoading}>Sign in</button>
</form>
```

**After:**
```tsx
const [state, formAction, isPending] = useActionState(loginAction, {})

<form action={formAction}>
  <input name="email" />
  <SubmitButton isPending={isPending}>Sign in</SubmitButton>
</form>
```

**Key Changes:**
- Removed manual state management (`useState` for email, password, error)
- Removed `useAuth()` hook wrapper
- Forms use `action={formAction}` instead of `onSubmit`
- Inputs use `name` attribute instead of controlled values
- Automatic pending state from `useActionState`

### 3. Submit Button Component (`components/auth/submit-button.tsx`)

**New Component:**
```tsx
export function SubmitButton({ isPending, children }: SubmitButtonProps) {
  return (
    <button type="submit" disabled={isPending}>
      {isPending ? `${children}ing...` : children}
    </button>
  )
}
```

Reusable component that handles pending state automatically.

### 4. useAuth Hook (`lib/hooks/use-auth.ts`)

**Before:**
```ts
export function useAuth() {
  const { user, isLoading, setLoading } = useAuthStore()

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const result = await login(email, password)
    // ... error handling
  }

  return { user, isLoading, signIn, signUp, signOut }
}
```

**After:**
```ts
export function useAuth() {
  const { user, isLoading, isOffline, lastSyncTime } = useAuthStore()
  return { user, isLoading, isOffline, lastSyncTime }
}
```

**Key Changes:**
- Simplified to read-only state access
- Removed action wrappers (`signIn`, `signUp`, `signOut`)
- Use Server Actions directly with `useActionState` instead

### 5. Dashboard Header (`components/layout/dashboard-header.tsx`)

**Before:**
```tsx
const { user, signOut, isLoading } = useAuth()
<button onClick={() => signOut()} disabled={isLoading}>
  {isLoading ? 'Logging out...' : 'Logout'}
</button>
```

**After:**
```tsx
const { user } = useAuth()
<form action={logoutAction}>
  <button type="submit">Logout</button>
</form>
```

**Key Changes:**
- Uses `logoutAction` directly via form action
- No need to track loading state manually

## Benefits

### 1. Less Code
- Removed ~50 lines of redundant state management
- No manual error/loading state tracking
- Cleaner, more declarative components

### 2. Better Patterns
- Follows React 19 best practices
- Server Actions receive `FormData` (standard pattern)
- Progressive enhancement (forms work without JS)

### 3. Type Safety
- `AuthState` type ensures consistent error/success handling
- TypeScript enforces proper action signatures

### 4. Server-Side Validation
- Password matching validation now on server
- More secure (client can't bypass validation)

### 5. Automatic Pending States
- `useActionState` provides `isPending` automatically
- No need to manually track `isLoading`

## Files Modified

```
✏️  lib/actions/auth.ts          - Updated to useActionState pattern
✏️  app/(auth)/login/page.tsx    - Refactored to useActionState
✏️  app/(auth)/signup/page.tsx   - Refactored to useActionState
✏️  lib/hooks/use-auth.ts        - Simplified to read-only state
✏️  components/layout/dashboard-header.tsx - Use logoutAction directly
➕  components/auth/submit-button.tsx - New reusable component
```

## Migration Guide

### For New Forms

Use this pattern for any new auth-related forms:

```tsx
'use client'

import { useActionState } from 'react'
import { myAction } from '@/lib/actions/auth'
import { SubmitButton } from '@/components/auth/submit-button'

export function MyForm() {
  const [state, formAction, isPending] = useActionState(myAction, {})

  return (
    <form action={formAction}>
      {state.error && <div>{state.error}</div>}
      {state.success && <div>{state.success}</div>}

      <input name="field1" required />
      <input name="field2" required />

      <SubmitButton isPending={isPending}>
        Submit
      </SubmitButton>
    </form>
  )
}
```

### Server Action Pattern

```ts
export type ActionState = {
  error?: string
  success?: string
}

export async function myAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const field1 = formData.get('field1') as string

  // Validation
  if (!field1) {
    return { error: 'Field 1 is required' }
  }

  // Business logic
  try {
    // ... do something
    return { success: 'Operation completed!' }
  } catch (error) {
    return { error: error.message }
  }
}
```

## Testing Checklist

- ✅ Login form submits and redirects to /pos
- ✅ Signup form validates password matching
- ✅ Signup form validates password length (6+ chars)
- ✅ Error messages display correctly
- ✅ Success message shows for signup (email confirmation)
- ✅ Logout button works and redirects to /login
- ✅ Pending states show during submission
- ✅ Forms work without JavaScript (progressive enhancement)
- ✅ TypeScript builds without errors
- ✅ No ESLint warnings

## References

- [React 19 useActionState](https://react.dev/reference/react/useActionState)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement)
