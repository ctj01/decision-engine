// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './features/auth/LoginPage'
import { useAuth } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import type { JSX } from 'react'
/** Un guard que permite el acceso solo si hay token */
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <>
      <Navbar />
      <div className="pt-16">
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
        />
        <Route path="*" element={<Navigate to={useAuth().token ? "/dashboard" : "/login"} replace />} />
      </Routes>
      </div>
      
    </>
  )
}
