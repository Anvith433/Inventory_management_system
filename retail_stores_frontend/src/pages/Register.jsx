import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import PasswordField from '../components/PasswordField'
import Icon from '../components/Icon'

function Field({ id, label, hint, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input id={id} name={id} className="field" {...props} />
      {hint && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}

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
  const [submitting, setSubmitting] = useState(false)
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
      setError("Those two passwords don't match.")
      return
    }

    if (form.password.length < 6) {
      setError("Your password needs at least 6 characters.")
      return
    }

    setSubmitting(true)
    try {
      await register(form)
      navigate('/login', { state: { registered: true, email: form.email } })
    } catch (err) {
      setError(err.response?.data?.message || 'We couldn’t create your account. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      panelTitle={<>Your corner shop, <span className="italic text-marigold-300">one tap away.</span></>}
      panelBody="Tell us where you live and we’ll show you the shops that deliver to your door — no subscriptions, no minimum basket."
    >
      <p className="eyebrow">Create an account</p>
      <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-ink">Let’s get you set up</h1>
      <p className="mt-2 text-ink-soft">
        Already shopping with us?{' '}
        <Link to="/login" className="font-semibold text-forest-700 underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-tomato-100 bg-tomato-50 p-4 text-sm text-tomato-700" role="alert">
          <Icon name="alert" size={18} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <fieldset className="space-y-4">
          <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-100 text-xs text-forest-700">1</span>
            About you
          </legend>
          <Field id="name" label="Full name" placeholder="Priya Rao" autoComplete="name" value={form.name} onChange={handleChange} required />
          <Field id="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={handleChange} required />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-100 text-xs text-forest-700">2</span>
            Where should we deliver?
          </legend>
          <Field id="street" label="House & street" placeholder="12, 4th Cross, Indiranagar" autoComplete="street-address" value={form.street} onChange={handleChange} required />
          <div className="grid grid-cols-[1.4fr_1fr] gap-3">
            <Field
              id="city"
              label="City"
              placeholder="Bangalore"
              autoComplete="address-level2"
              value={form.city}
              onChange={handleChange}
              required
            />
            <Field
              id="pincode"
              label="Pincode"
              placeholder="560001"
              inputMode="numeric"
              autoComplete="postal-code"
              pattern="[0-9]{6}"
              title="Six digit pincode"
              value={form.pincode}
              onChange={handleChange}
              required
            />
          </div>
          <p className="-mt-1 flex items-start gap-2 text-xs text-ink-muted">
            <Icon name="pin" size={14} className="mt-px shrink-0" />
            We match you with shops in this city, and it can’t be changed later — so double-check the spelling.
          </p>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-100 text-xs text-forest-700">3</span>
            Pick a password
          </legend>
          <PasswordField
            id="password"
            name="password"
            label="Password"
            placeholder="At least 6 characters"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />
          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            label="Type it once more"
            placeholder="Same as above"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
          />
        </fieldset>

        <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">
          {submitting ? 'Setting things up…' : 'Create my account'}
          {!submitting && <Icon name="arrow-right" size={18} />}
        </button>
      </form>
    </AuthLayout>
  )
}
