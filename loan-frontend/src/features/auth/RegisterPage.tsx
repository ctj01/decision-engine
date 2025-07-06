
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

type FormData = {
  firstName: string
  lastName: string
  email: string
  identificationNumber: string
  password: string
  confirmPassword: string
}

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()
  const navigate = useNavigate()
  const password = watch('password', '')

  const onSubmit = async (data: FormData) => {
    try {
      const apiUrl = import.meta.env.VITE_AUTH_API ?? 'http://identity-server.local/api/account'
      await axios.post(`${apiUrl}/register`, data)
      alert('Registration successful! Please log in.')
      navigate('/login')
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        err.message ||
        'Unknown error'
      alert(`Registration failed: ${msg}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-semibold text-center mb-6">Create Account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
              First Name
            </label>
            <input
              id="firstName"
              {...register('firstName', { required: 'Required' })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              {...register('lastName', { required: 'Required' })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          {/* Identification Number */}
          <div>
            <label htmlFor="identificationNumber" className="block text-sm font-medium mb-1">
              ID Number
            </label>
            <input
              id="identificationNumber"
              {...register('identificationNumber', { required: 'Required' })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                errors.identificationNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.identificationNumber && (
              <p className="mt-1 text-sm text-red-500">
                {errors.identificationNumber.message}
              </p>
            )}
          </div>
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: 'Required',
                minLength: { value: 6, message: 'Min 6 chars' },
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', {
                required: 'Required',
                validate: (v) => v === password || 'Passwords do not match',
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full py-2 rounded-lg text-white font-medium
              ${isSubmitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {isSubmitting ? 'Registering…' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  )
}
