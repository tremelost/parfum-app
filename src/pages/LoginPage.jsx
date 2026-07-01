import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import sabiLogo from '../assets/sabi.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect to dashboard if already logged in or in demo mode
  useEffect(() => {
    if (!isSupabaseConfigured) {
      navigate('/', { replace: true })
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/', { replace: true })
    })
  }, [navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.')
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setError(signInError.message)
    } else {
      navigate('/', { replace: true })
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src={sabiLogo} alt="Sabi Logo" className="size-16 object-contain" />
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-950">Regarance</h1>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Masuk ke dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Gunakan email dan password
          </p>

          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                className="h-10 rounded-md border border-slate-200 px-3 outline-none ring-teal-600/20 transition focus:border-teal-600 focus:ring-4"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-10 rounded-md border border-slate-200 px-3 outline-none ring-teal-600/20 transition focus:border-teal-600 focus:ring-4"
              />
            </label>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn size={17} />
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
