// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Navbar() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

 return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      {/* Aquí usamos w-[90%] para forzar el 90% de ancho */}
      <div className="w-[90%] mx-auto flex items-center justify-between py-3">
        {/* Left */}
        <div className="flex-1">
          <Link
            to="/"
            className="text-gray-900 font-medium hover:text-gray-700 transition"
          >
            Home
          </Link>
        </div>

        {/* Center */}
        <div className="flex-1 text-center">
          <Link
            to="/"
            className="text-gray-900 font-extrabold text-xl hover:text-gray-700 transition"
          >
            LoanApp
          </Link>
        </div>

        {/* Right */}
        <div className="flex-1 flex justify-end space-x-4">
          {!token ? (
            <>
              <Link
                to="/login"
                className="text-gray-900 font-medium hover:text-gray-700 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="text-gray-900 font-medium hover:text-gray-700 transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
