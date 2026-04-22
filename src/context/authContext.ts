import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'

export interface AuthContextValue {
  user: User | null
  isAdmin: boolean
  loading: boolean
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAdmin: false,
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

