import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

/**
 * Provides auth context to children without forcing login.
 * Auth is optional — users can access the app without logging in.
 * If Supabase is configured, the session is tracked for RLS purposes.
 */
export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    // In demo mode, skip auth entirely
    if (!isSupabaseConfigured) {
      setSession(null)
      return
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Still loading auth state
  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Memuat...
      </div>
    )
  }

  // Demo mode: always allow access
  if (!isSupabaseConfigured) {
    return children
  }

  // No session: redirect to login
  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}
