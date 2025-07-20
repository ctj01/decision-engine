// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/auth/Login'
import ProtectedRoute from './components/auth/ProtectedRoute'
import DashboardPage from './components/dashboard/DashboardPage'
import './App.css'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}
