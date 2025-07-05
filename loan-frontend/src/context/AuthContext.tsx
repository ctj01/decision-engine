// src/context/AuthContext.tsx
import { createContext, useContext, useState } from 'react'
import type  {ReactNode } from 'react'
import axios from 'axios'

interface AuthContextType {
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)

  const login = async (username: string, password: string) => {
    const params = new URLSearchParams()
    params.append('grant_type', 'password')
    params.append('username', username)
    params.append('password', password)
    params.append('client_id', 'loan_app_client')

    const response = await axios.post(
      'http://identityserver.local/connect/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}
    )
    setToken(response.data.access_token)
    localStorage.setItem('token', response.data.access_token)
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
