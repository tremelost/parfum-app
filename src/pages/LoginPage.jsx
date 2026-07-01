import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, LogIn, UserPlus } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    setSuccess('')

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.')
      setLoading(false)
      return
    }

    if (isRegister) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
      } else {
        setSuccess('Registrasi berhasil! Cek email untuk konfirmasi, lalu login.')
        setIsRegister(false)
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        setError(signInError.message)
      } else {
        navigate('/', { replace: true })
      }
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/25">
            <Database size={28} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-950">Parfum Stock</h1>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            {isRegister ? 'Buat akun baru' : 'Masuk ke dashboard'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isRegister
              ? 'Daftar dengan email dan password'
              : 'Gunakan email dan password'}
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
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                className="h-10 rounded-md border border-slate-200 px-3 outline-none ring-teal-600/20 transition focus:border-teal-600 focus:ring-4"
              />
            </label>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRegister ? <UserPlus size={17} /> : <LogIn size={17} />}
              {loading
                ? 'Memproses...'
                : isRegister
                  ? 'Daftar'
                  : 'Masuk'}
            </button>
          </form>

          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
                setSuccess('')
              }}
              className="text-sm font-medium text-teal-700 transition hover:text-teal-800"
            >
              {isRegister
                ? 'Sudah punya akun? Masuk'
                : 'Belum punya akun? Daftar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
