// src/features/auth/LoginPage.tsx
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

type FormData = {
  username: string
  password: string
}

export function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>()
  const { login } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async ({ username, password }: FormData) => {
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (e: any) {
      alert('Login failed: ' + (e.response?.data?.error_description || e.message))
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-semibold text-center mb-6">Welcome Back</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
            <input
              id="username"
              {...register('username', { required: 'Required' })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>}
          </div>
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              {...register('password', { required: 'Required' })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>
          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 rounded-lg text-white font-medium ${
              isSubmitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
        </p>
      </div>
    </div>
  )
}
