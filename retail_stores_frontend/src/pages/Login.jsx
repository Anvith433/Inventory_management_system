// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import PasswordField from '../components/PasswordField'
import Icon from '../components/Icon'

export default function Login() {
  const location = useLocation()
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const justRegistered = !!location.state?.registered

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const payload = {
        email: form.email,
        password: form.password
      }

      const userData = await login(payload)

      if (userData.role === 'ROLE_ADMIN') {
        navigate('/admindashboard', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }

    } catch (err) {
      setError(err.response?.data?.message || 'That email and password don’t match. Have another go?')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      panelTitle={<>Good to see you <span className="italic text-marigold-300">again.</span></>}
      panelBody="Your basket is right where you left it. Sign in and pick up from the shops near you."
    >
      <p className="eyebrow">Sign in</p>
      <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-ink">Welcome back</h1>
      <p className="mt-2 text-ink-soft">
        New here?{' '}
        <Link to="/register" className="font-semibold text-forest-700 underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>

      {justRegistered && !error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-forest-200 bg-forest-50 p-4 text-sm text-forest-800">
          <Icon name="check" size={18} className="mt-0.5" />
          <span>You’re all set. Sign in with your new account to start shopping.</span>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-tomato-100 bg-tomato-50 p-4 text-sm text-tomato-700" role="alert">
          <Icon name="alert" size={18} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="field"
            required
          />
        </div>

        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">
          {submitting ? 'Signing you in…' : 'Sign in'}
          {!submitting && <Icon name="arrow-right" size={18} />}
        </button>
      </form>
    </AuthLayout>
  )
}
