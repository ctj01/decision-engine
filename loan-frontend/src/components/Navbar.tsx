// src/components/Navbar.tsx
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CreditCardIcon, PlusIcon, FileTextIcon, BarChartIcon } from './icons'

export function Navbar() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActivePath = (path: string) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 w-full glass-effect z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to={token ? "/dashboard" : "/"}
              className="flex items-center space-x-2 group"
            >
              <div className="gradient-primary p-2 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <CreditCardIcon className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-gradient">
                LoanApp
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {!token ? (
                <>
                  <Link
                    to="/login"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActivePath('/login')
                        ? 'bg-white/20 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/10'
                    }`}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm"
                  >
                    Registrarse
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActivePath('/dashboard')
                        ? 'gradient-primary text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/20'
                    }`}
                  >
                    <BarChartIcon size={18} />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    to="/loan-application"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActivePath('/loan-application')
                        ? 'gradient-success text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/20'
                    }`}
                  >
                    <PlusIcon size={18} />
                    <span>Solicitar</span>
                  </Link>
                  
                  <Link
                    to="/loan-history"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActivePath('/loan-history')
                        ? 'gradient-warning text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/20'
                    }`}
                  >
                    <FileTextIcon size={18} />
                    <span>Historial</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="btn-danger text-sm ml-4"
                  >
                    Cerrar Sesión
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            {token && (
              <button
                onClick={handleLogout}
                className="btn-danger text-sm"
              >
                Salir
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {token && (
        <div className="md:hidden bg-white/10 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActivePath('/dashboard')
                  ? 'bg-white/20 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/10'
              }`}
            >
              <BarChartIcon size={18} />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/loan-application"
              className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActivePath('/loan-application')
                  ? 'bg-white/20 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/10'
              }`}
            >
              <PlusIcon size={18} />
              <span>Solicitar Préstamo</span>
            </Link>
            
            <Link
              to="/loan-history"
              className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActivePath('/loan-history')
                  ? 'bg-white/20 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/10'
              }`}
            >
              <FileTextIcon size={18} />
              <span>Historial</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
