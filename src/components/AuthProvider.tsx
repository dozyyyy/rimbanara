import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'

import { auth } from '../lib/firebase.ts'
import { hasAdminDocument, NOT_ADMIN_MESSAGE } from '../services/auth.ts'
import { AuthContext } from './auth-context.ts'
import type { AuthStatus } from './auth-context.ts'

interface AuthState {
  status: AuthStatus
  user: User | null
  notice: string | null
}

/**
 * Restores the Firebase session and re-checks `admins/{uid}`, so an account
 * without an admin document is signed out instead of reaching any admin page.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    notice: null,
  })

  useEffect(() => {
    let active = true

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!active) return

      if (!user) {
        // Keep any notice (a rejected non-admin account) for the login screen.
        setState((previous) => ({
          ...previous,
          status: 'signedOut',
          user: null,
        }))
        return
      }

      void (async () => {
        const isAdmin = await hasAdminDocument(user.uid)
        if (!active) return
        if (isAdmin) {
          setState({ status: 'admin', user, notice: null })
          return
        }
        await signOut(auth)
        if (!active) return
        setState({
          status: 'signedOut',
          user: null,
          notice: NOT_ADMIN_MESSAGE,
        })
      })()
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const clearNotice = useCallback(() => {
    setState((previous) => ({ ...previous, notice: null }))
  }, [])

  const value = useMemo(
    () => ({
      status: state.status,
      user: state.user,
      notice: state.notice,
      clearNotice,
    }),
    [state.status, state.user, state.notice, clearNotice],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
