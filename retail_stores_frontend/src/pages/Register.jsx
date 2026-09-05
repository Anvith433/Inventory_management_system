import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const initialForm = {
    name: '',
    email: '',
    street: '',
    city: '',
    pincode: '',
    password: '',
    confirmPassword: ''
  }

  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      await register(form)
      alert('Registration successful! Please login.')
      navigate('/login')
    } catch (err) {
      setError('Registration failed. Try again.')
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-200">
        <Link to="/" className="text-cyan-600 text-sm font-medium hover:underline">
          Back to Home
        </Link>

        <h2 className="text-4xl font-bold text-center mt-6 mb-2 text-gray-800">
          Create Account
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Join Retail Store Management
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium mb-6 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-3.5 border-2 border-gray-300 rounded-xl focus:border-cyan-500 outline-none text-base transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-3.5 border-2 border-gray-300 rounded-xl focus:border-cyan-500 outline-none text-base transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              Street Address
            </label>
            <input
              type="text"
              name="street"
              placeholder="123 Main St"
              value={form.street}
              onChange={handleChange}
              required
              className="w-full p-3.5 border-2 border-gray-300 rounded-xl focus:border-cyan-500 outline-none text-base transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                City
              </label>
              <input
                type="text"
                name="city"
                placeholder="Bangalore"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full p-3.5 border-2 border-gray-300 rounded-xl focus:border-cyan-500 outline-none text-base transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                placeholder="560001"
                value={form.pincode}
                onChange={handleChange}
                required
                pattern="[0-9]{6}"
                className="w-full p-3.5 border-2 border-gray-300 rounded-xl focus:border-cyan-500 outline-none text-base transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full p-3.5 border-2 border-gray-300 rounded-xl focus:border-cyan-500 outline-none text-base transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full p-3.5 border-2 border-gray-300 rounded-xl focus:border-cyan-500 outline-none text-base transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Create Account
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-600 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}