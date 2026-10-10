import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import { useToast } from '../context/ToastContext'

export default function Payment() {
  const nav = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const timer = setTimeout(() => {
      toast('Payment received — your order is being packed.', { tone: 'success' })
      nav('/dashboard')
    }, 2000)

    return () => clearTimeout(timer)
  }, [nav, toast])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="card w-full max-w-md p-10 text-center">
          <div className="relative mx-auto mb-7 h-20 w-20">
            <span className="absolute inset-0 rounded-full border-4 border-cream-200" />
            <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-forest-700" />
            <span className="absolute inset-0 flex items-center justify-center text-forest-700">
              <Icon name="card" size={28} />
            </span>
          </div>

          <h2 className="font-display text-3xl font-medium text-ink">Processing your payment</h2>
          <p className="mt-3 text-sm text-ink-soft">
            Hang tight for a moment while we confirm things with the bank.
          </p>

          <p className="mt-8 flex items-center justify-center gap-2 border-t border-line pt-5 text-xs text-ink-muted">
            <Icon name="lock" size={14} />
            Encrypted connection
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
