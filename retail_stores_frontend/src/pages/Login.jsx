// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const payload = {
        email: form.email,
        password: form.password
      }

      const userData = await login(payload)

      
      console.log("USER DATA RECEIVED:", userData)

     
      if (userData.role === 'ROLE_ADMIN') {
        navigate('/admindashboard', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200">
        <Link to="/" className="text-cyan-600 text-sm font-medium hover:underline">
          Back to Home
        </Link>

        <h2 className="text-4xl font-bold text-center mt-8 mb-2 text-gray-800">
          Welcome Back!
        </h2>
        <p className="text-center text-gray-600 mb-8">Login to your account</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium mb-6 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-cyan-500 outline-none text-lg transition-all"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-cyan-500 outline-none text-lg transition-all"
            required
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Login Securely
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          New here?{' '}
          <Link to="/register" className="text-cyan-600 font-bold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  )
}
