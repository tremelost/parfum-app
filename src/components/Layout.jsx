import { NavLink, Outlet } from 'react-router-dom'
import {
  AlertCircle,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  RefreshCcw,
  Search,
  ShoppingCart,
} from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import useParfumData from '../hooks/useParfumData'
import sabiLogo from '../assets/sabi.png'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/stock', label: 'Stock', icon: Boxes },
  { to: '/purchases', label: 'Pembelian', icon: ClipboardList },
  { to: '/sales', label: 'Penjualan', icon: ShoppingCart },
]

function navLinkClass({ isActive }) {
  return `flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition ${
    isActive
      ? 'bg-slate-950 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
  }`
}

function mobileNavLinkClass({ isActive }) {
  return `flex h-10 items-center justify-center gap-1 rounded-md text-xs font-semibold transition sm:gap-2 ${
    isActive
      ? 'bg-slate-950 text-white'
      : 'border border-slate-200 bg-white text-slate-600'
  }`
}

export default function Layout() {
  const data = useParfumData()

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col px-5 py-6">
          <div className="flex items-center gap-3">
            <img src={sabiLogo} alt="Sabi Logo" className="size-10 object-contain" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Admin
              </p>
              <h1 className="text-xl font-bold">Regarance</h1>
            </div>
          </div>

          <nav className="mt-8 grid gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">
                {isSupabaseConfigured ? 'Supabase tersambung' : 'Mode demo lokal'}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Stock dihitung dari pembelian dikurangi penjualan.
              </p>
            </div>

            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <section className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-teal-700">Administrasi Parfum</p>
              <h2 className="text-2xl font-bold tracking-normal text-slate-950">
                Dashboard operasional
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />
                <input
                  value={data.search}
                  onChange={(event) => data.setSearch(event.target.value)}
                  placeholder="Cari tanggal, kategori, item"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none ring-teal-600/20 transition focus:border-teal-600 focus:ring-4 sm:w-72"
                />
              </div>
              <button
                type="button"
                onClick={data.loadData}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <RefreshCcw size={16} />
                Refresh
              </button>
            </div>
          </div>

          {/* Mobile navigation */}
          <nav className="mt-4 grid grid-cols-4 gap-2 lg:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={mobileNavLinkClass}
              >
                <item.icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {data.notice && (
            <div className="mb-5 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <span>{data.notice}</span>
            </div>
          )}

          <Outlet context={data} />
        </div>
      </section>
    </main>
  )
}
