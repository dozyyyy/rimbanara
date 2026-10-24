import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'

export type AuthStatus = 'loading' | 'signedOut' | 'admin'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  /** Message to show on the login screen, e.g. a rejected non-admin account. */
  notice: string | null
  clearNotice: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
