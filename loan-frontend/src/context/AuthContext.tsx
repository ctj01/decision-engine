// src/context/AuthContext.tsx
import { createContext, useContext, useState } from 'react'
import axios from 'axios'
import type { ReactNode } from 'react'

interface AuthContextType {
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType|undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string| null>(null)

  const login = async (username: string, password: string) => {
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: 'loan-ropc-client',
      scope: 'openid profile loan.request',
      username,
      password,
    })
    const resp = await axios.post(
      `http://identity-server.local/connect/token`,
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    setToken(resp.data.access_token)
    // opcional: guarda en localStorage:
    localStorage.setItem('access_token', resp.data.access_token)
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('access_token')
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
