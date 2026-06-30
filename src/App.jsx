import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BarChart3,
  Boxes,
  CalendarDays,
  ClipboardList,
  Database,
  LayoutDashboard,
  Plus,
  RefreshCcw,
  Search,
  ShoppingCart,
  Trash2,
  WalletCards,
} from 'lucide-react'
import { isSupabaseConfigured, supabase } from './lib/supabase'

const PURCHASE_TABLE = 'pembelian_manual'
const SALES_TABLE = 'penjualan_manual'

const today = new Date().toISOString().slice(0, 10)

const initialPurchases = [
  {
    id: 'demo-buy-1',
    tanggal: '2026-07-01',
    kategori: 'EDP',
    item: 'Aroma Vanilla Oud 50ml',
    harga: 85000,
    qty: 12,
  },
  {
    id: 'demo-buy-2',
    tanggal: '2026-07-01',
    kategori: 'Botol',
    item: 'Botol kaca 50ml',
    harga: 6500,
    qty: 40,
  },
  {
    id: 'demo-buy-3',
    tanggal: '2026-06-30',
    kategori: 'EDT',
    item: 'Fresh Citrus 30ml',
    harga: 52000,
    qty: 9,
  },
  {
    id: 'demo-buy-4',
    tanggal: '2026-06-29',
    kategori: 'Packaging',
    item: 'Box parfum premium',
    harga: 4800,
    qty: 55,
  },
]

const initialSales = [
  {
    id: 'demo-sale-1',
    tanggal: '2026-07-01',
    item: 'Aroma Vanilla Oud 50ml',
    harga: 125000,
    qty: 3,
  },
  {
    id: 'demo-sale-2',
    tanggal: '2026-06-30',
    item: 'Fresh Citrus 30ml',
    harga: 78000,
    qty: 2,
  },
]

const emptyPurchaseForm = {
  tanggal: today,
  kategori: 'EDP',
  item: '',
  harga: '',
  qty: 1,
}

const emptySaleForm = {
  tanggal: today,
  item: '',
  harga: '',
  qty: 1,
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'stock', label: 'Stock', icon: Boxes },
  { id: 'purchases', label: 'Pembelian', icon: ClipboardList },
  { id: 'sales', label: 'Penjualan', icon: ShoppingCart },
]

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getLocalRows(key, fallbackRows) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallbackRows
  } catch {
    return fallbackRows
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [purchases, setPurchases] = useState([])
  const [sales, setSales] = useState([])
  const [purchaseForm, setPurchaseForm] = useState(emptyPurchaseForm)
  const [saleForm, setSaleForm] = useState(emptySaleForm)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingPurchase, setSavingPurchase] = useState(false)
  const [savingSale, setSavingSale] = useState(false)
  const [notice, setNotice] = useState('')

  const loadData = async () => {
    setLoading(true)
    setNotice('')

    if (!isSupabaseConfigured) {
      setPurchases(getLocalRows('parfum-purchases', initialPurchases))
      setSales(getLocalRows('parfum-sales', initialSales))
      setNotice('Mode demo aktif. Isi .env untuk menyambungkan Supabase.')
      setLoading(false)
      return
    }

    const [purchaseResult, saleResult] = await Promise.all([
      supabase
        .from(PURCHASE_TABLE)
        .select('id,tanggal,kategori,item,harga,qty')
        .order('tanggal', { ascending: false }),
      supabase
        .from(SALES_TABLE)
        .select('id,tanggal,item,harga,qty')
        .order('tanggal', { ascending: false }),
    ])

    if (purchaseResult.error || saleResult.error) {
      setNotice(
        purchaseResult.error?.message ??
          saleResult.error?.message ??
          'Gagal memuat data.',
      )
    } else {
      setPurchases(purchaseResult.data ?? [])
      setSales(saleResult.data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    const purchaseChannel = supabase
      .channel('realtime-pembelian-manual')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: PURCHASE_TABLE },
        loadData,
      )
      .subscribe()

    const salesChannel = supabase
      .channel('realtime-penjualan-manual')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: SALES_TABLE },
        loadData,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(purchaseChannel)
      supabase.removeChannel(salesChannel)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured && purchases.length > 0) {
      localStorage.setItem('parfum-purchases', JSON.stringify(purchases))
    }
  }, [purchases])

  useEffect(() => {
    if (!isSupabaseConfigured && sales.length > 0) {
      localStorage.setItem('parfum-sales', JSON.stringify(sales))
    }
  }, [sales])

  const filteredPurchases = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return purchases

    return purchases.filter((purchase) =>
      [purchase.tanggal, purchase.kategori, purchase.item]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    )
  }, [purchases, search])

  const filteredSales = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return sales

    return sales.filter((sale) =>
      [sale.tanggal, sale.item].join(' ').toLowerCase().includes(keyword),
    )
  }, [sales, search])

  const stockRows = useMemo(() => {
    const grouped = new Map()

    purchases.forEach((purchase) => {
      const current = grouped.get(purchase.item) ?? {
        kategori: purchase.kategori,
        item: purchase.item,
        masuk: 0,
        keluar: 0,
        qty: 0,
        total: 0,
        hargaRataRata: 0,
      }

      const qty = Number(purchase.qty) || 0
      const total = (Number(purchase.harga) || 0) * qty

      current.masuk += qty
      current.total += total
      current.hargaRataRata = current.masuk ? current.total / current.masuk : 0
      current.qty = current.masuk - current.keluar
      grouped.set(purchase.item, current)
    })

    sales.forEach((sale) => {
      const current = grouped.get(sale.item) ?? {
        kategori: '-',
        item: sale.item,
        masuk: 0,
        keluar: 0,
        qty: 0,
        total: 0,
        hargaRataRata: 0,
      }

      current.keluar += Number(sale.qty) || 0
      current.qty = current.masuk - current.keluar
      grouped.set(sale.item, current)
    })

    return [...grouped.values()].sort((a, b) => b.qty - a.qty)
  }, [purchases, sales])

  const stats = useMemo(() => {
    const totalBelanja = purchases.reduce(
      (sum, purchase) =>
        sum + (Number(purchase.harga) || 0) * (Number(purchase.qty) || 0),
      0,
    )
    const totalPenjualan = sales.reduce(
      (sum, sale) => sum + (Number(sale.harga) || 0) * (Number(sale.qty) || 0),
      0,
    )
    const totalQtyMasuk = purchases.reduce(
      (sum, purchase) => sum + (Number(purchase.qty) || 0),
      0,
    )
    const totalQtyTerjual = sales.reduce(
      (sum, sale) => sum + (Number(sale.qty) || 0),
      0,
    )

    return {
      totalBelanja,
      totalPenjualan,
      totalQtyMasuk,
      totalQtyTerjual,
      totalItem: stockRows.length,
      transaksi: purchases.length + sales.length,
    }
  }, [purchases, sales, stockRows.length])

  const recentPurchases = filteredPurchases.slice(0, 6)
  const recentSales = filteredSales.slice(0, 6)

  const handlePurchaseSubmit = async (event) => {
    event.preventDefault()
    setSavingPurchase(true)
    setNotice('')

    const payload = {
      tanggal: purchaseForm.tanggal,
      kategori: purchaseForm.kategori.trim(),
      item: purchaseForm.item.trim(),
      harga: Number(purchaseForm.harga),
      qty: Number(purchaseForm.qty),
    }

    if (!payload.item || !payload.kategori || payload.harga < 0 || payload.qty < 1) {
      setNotice('Lengkapi item, kategori, harga, dan qty pembelian dengan benar.')
      setSavingPurchase(false)
      return
    }

    if (!isSupabaseConfigured) {
      setPurchases((current) => [
        { ...payload, id: crypto.randomUUID() },
        ...current,
      ])
      setPurchaseForm(emptyPurchaseForm)
      setSavingPurchase(false)
      return
    }

    const { error } = await supabase.from(PURCHASE_TABLE).insert(payload)

    if (error) {
      setNotice(error.message)
    } else {
      setPurchaseForm(emptyPurchaseForm)
      await loadData()
    }

    setSavingPurchase(false)
  }

  const handleSaleSubmit = async (event) => {
    event.preventDefault()
    setSavingSale(true)
    setNotice('')

    const payload = {
      tanggal: saleForm.tanggal,
      item: saleForm.item.trim(),
      harga: Number(saleForm.harga),
      qty: Number(saleForm.qty),
    }

    if (!payload.item || payload.harga < 0 || payload.qty < 1) {
      setNotice('Lengkapi tanggal, item, harga, dan qty penjualan dengan benar.')
      setSavingSale(false)
      return
    }

    if (!isSupabaseConfigured) {
      setSales((current) => [{ ...payload, id: crypto.randomUUID() }, ...current])
      setSaleForm(emptySaleForm)
      setSavingSale(false)
      return
    }

    const { error } = await supabase.from(SALES_TABLE).insert(payload)

    if (error) {
      setNotice(error.message)
    } else {
      setSaleForm(emptySaleForm)
      await loadData()
    }

    setSavingSale(false)
  }

  const deletePurchase = async (id) => {
    if (!isSupabaseConfigured) {
      setPurchases((current) => current.filter((purchase) => purchase.id !== id))
      return
    }

    const { error } = await supabase.from(PURCHASE_TABLE).delete().eq('id', id)
    if (error) {
      setNotice(error.message)
    } else {
      await loadData()
    }
  }

  const deleteSale = async (id) => {
    if (!isSupabaseConfigured) {
      setSales((current) => current.filter((sale) => sale.id !== id))
      return
    }

    const { error } = await supabase.from(SALES_TABLE).delete().eq('id', id)
    if (error) {
      setNotice(error.message)
    } else {
      await loadData()
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Database size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Admin
              </p>
              <h1 className="text-xl font-bold">Parfum Stock</h1>
            </div>
          </div>

          <nav className="mt-8 grid gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">
              {isSupabaseConfigured ? 'Supabase tersambung' : 'Mode demo lokal'}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Stock dihitung dari pembelian dikurangi penjualan.
            </p>
          </div>
        </div>
      </aside>

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
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari tanggal, kategori, item"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none ring-teal-600/20 transition focus:border-teal-600 focus:ring-4 sm:w-72"
                />
              </div>
              <button
                type="button"
                onClick={loadData}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <RefreshCcw size={16} />
                Refresh
              </button>
            </div>
          </div>

          <nav className="mt-4 grid grid-cols-4 gap-2 lg:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex h-10 items-center justify-center gap-1 rounded-md text-xs font-semibold transition sm:gap-2 ${
                  activeTab === tab.id
                    ? 'bg-slate-950 text-white'
                    : 'border border-slate-200 bg-white text-slate-600'
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {notice && (
            <div className="mb-5 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <span>{notice}</span>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              stockRows={stockRows}
              recentPurchases={recentPurchases}
              recentSales={recentSales}
              loading={loading}
            />
          )}

          {activeTab === 'stock' && (
            <StockView stockRows={stockRows} loading={loading} />
          )}

          {activeTab === 'purchases' && (
            <PurchaseView
              form={purchaseForm}
              setForm={setPurchaseForm}
              rows={filteredPurchases}
              saving={savingPurchase}
              loading={loading}
              onSubmit={handlePurchaseSubmit}
              onDelete={deletePurchase}
            />
          )}

          {activeTab === 'sales' && (
            <SalesView
              form={saleForm}
              setForm={setSaleForm}
              rows={filteredSales}
              saving={savingSale}
              loading={loading}
              onSubmit={handleSaleSubmit}
              onDelete={deleteSale}
            />
          )}
        </div>
      </section>
    </main>
  )
}

function StatCard({ title, value, icon: Icon, tone }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <div className={`flex size-10 items-center justify-center rounded-md ${tone}`}>
          <Icon size={20} />
        </div>
      </div>
    </article>
  )
}

function DashboardView({ stats, stockRows, recentPurchases, recentSales, loading }) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total belanja"
          value={formatCurrency(stats.totalBelanja)}
          icon={WalletCards}
          tone="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          title="Total penjualan"
          value={formatCurrency(stats.totalPenjualan)}
          icon={ShoppingCart}
          tone="bg-sky-100 text-sky-700"
        />
        <StatCard
          title="Qty terjual"
          value={stats.totalQtyTerjual}
          icon={BarChart3}
          tone="bg-violet-100 text-violet-700"
        />
        <StatCard
          title="Transaksi"
          value={stats.transaksi}
          icon={ClipboardList}
          tone="bg-amber-100 text-amber-700"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Stock paling banyak" subtitle="Pembelian dikurangi penjualan">
          <DataState loading={loading} empty={!stockRows.length}>
            <div className="grid gap-3">
              {stockRows.slice(0, 5).map((row) => (
                <div
                  key={row.item}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-md border border-slate-200 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {row.item}
                    </p>
                    <p className="text-xs text-slate-500">
                      Masuk {row.masuk} pcs, keluar {row.keluar} pcs
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-950">{row.qty}</p>
                    <p className="text-xs text-slate-500">pcs</p>
                  </div>
                </div>
              ))}
            </div>
          </DataState>
        </Panel>

        <Panel title="Penjualan terbaru" subtitle="Data manual terakhir masuk">
          <SaleTable rows={recentSales} loading={loading} compact />
        </Panel>
      </section>

      <Panel title="Pembelian terbaru" subtitle="Data belanja manual terakhir masuk">
        <PurchaseTable rows={recentPurchases} loading={loading} compact />
      </Panel>
    </div>
  )
}

function StockView({ stockRows, loading }) {
  return (
    <Panel title="Realtime stock" subtitle="Dihitung otomatis dari pembelian dan penjualan">
      <DataState loading={loading} empty={!stockRows.length}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-3 pr-4 font-semibold">Kategori</th>
                <th className="py-3 pr-4 font-semibold">Item</th>
                <th className="py-3 pr-4 text-right font-semibold">Masuk</th>
                <th className="py-3 pr-4 text-right font-semibold">Keluar</th>
                <th className="py-3 pr-4 text-right font-semibold">Stock</th>
                <th className="py-3 pr-4 text-right font-semibold">Harga rata-rata</th>
                <th className="py-3 text-right font-semibold">Nilai stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockRows.map((row) => (
                <tr key={row.item}>
                  <td className="py-3 pr-4 text-slate-600">{row.kategori}</td>
                  <td className="py-3 pr-4 font-medium text-slate-950">{row.item}</td>
                  <td className="py-3 pr-4 text-right">{row.masuk}</td>
                  <td className="py-3 pr-4 text-right">{row.keluar}</td>
                  <td
                    className={`py-3 pr-4 text-right font-semibold ${
                      row.qty < 0 ? 'text-red-600' : 'text-slate-950'
                    }`}
                  >
                    {row.qty}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {formatCurrency(row.hargaRataRata)}
                  </td>
                  <td className="py-3 text-right">
                    {formatCurrency(row.hargaRataRata * row.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
    </Panel>
  )
}

function PurchaseView({
  form,
  setForm,
  rows,
  saving,
  loading,
  onSubmit,
  onDelete,
}) {
  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <Panel title="Input pembelian" subtitle="Catat belanja manual supplier">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <DateField value={form.tanggal} onChange={(value) => updateForm('tanggal', value)} />

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Kategori
            <select
              value={form.kategori}
              onChange={(event) => updateForm('kategori', event.target.value)}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 outline-none ring-teal-600/20 focus:border-teal-600 focus:ring-4"
            >
              <option>EDP</option>
              <option>EDT</option>
              <option>Botol</option>
              <option>Packaging</option>
              <option>Essential Oil</option>
              <option>Alkohol</option>
            </select>
          </label>

          <TextField
            label="Item"
            value={form.item}
            onChange={(value) => updateForm('item', value)}
            placeholder="Nama parfum atau bahan"
          />

          <NumberPair
            harga={form.harga}
            qty={form.qty}
            onHargaChange={(value) => updateForm('harga', value)}
            onQtyChange={(value) => updateForm('qty', value)}
          />

          <SubmitButton saving={saving} label="Simpan pembelian" />
        </form>
      </Panel>

      <Panel title="Data pembelian manual" subtitle="Database: id, tanggal, kategori, item, harga, qty">
        <PurchaseTable rows={rows} loading={loading} onDelete={onDelete} />
      </Panel>
    </div>
  )
}

function SalesView({ form, setForm, rows, saving, loading, onSubmit, onDelete }) {
  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <Panel title="Input penjualan" subtitle="Catat penjualan manual customer">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <DateField value={form.tanggal} onChange={(value) => updateForm('tanggal', value)} />
          <TextField
            label="Item"
            value={form.item}
            onChange={(value) => updateForm('item', value)}
            placeholder="Nama parfum yang terjual"
          />
          <NumberPair
            harga={form.harga}
            qty={form.qty}
            onHargaChange={(value) => updateForm('harga', value)}
            onQtyChange={(value) => updateForm('qty', value)}
          />
          <SubmitButton saving={saving} label="Simpan penjualan" />
        </form>
      </Panel>

      <Panel title="Data penjualan" subtitle="Database: id, tanggal, item, harga, qty">
        <SaleTable rows={rows} loading={loading} onDelete={onDelete} />
      </Panel>
    </div>
  )
}

function DateField({ value, onChange }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      Tanggal
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-slate-200 px-3 outline-none ring-teal-600/20 focus:border-teal-600 focus:ring-4"
      />
    </label>
  )
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-md border border-slate-200 px-3 outline-none ring-teal-600/20 focus:border-teal-600 focus:ring-4"
      />
    </label>
  )
}

function NumberPair({ harga, qty, onHargaChange, onQtyChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
      <label className="grid gap-1.5 text-sm font-medium text-slate-700">
        Harga
        <input
          type="number"
          min="0"
          value={harga}
          onChange={(event) => onHargaChange(event.target.value)}
          placeholder="85000"
          className="h-10 rounded-md border border-slate-200 px-3 outline-none ring-teal-600/20 focus:border-teal-600 focus:ring-4"
        />
      </label>

      <label className="grid gap-1.5 text-sm font-medium text-slate-700">
        Qty
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(event) => onQtyChange(event.target.value)}
          className="h-10 rounded-md border border-slate-200 px-3 outline-none ring-teal-600/20 focus:border-teal-600 focus:ring-4"
        />
      </label>
    </div>
  )
}

function SubmitButton({ saving, label }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Plus size={17} />
      {saving ? 'Menyimpan...' : label}
    </button>
  )
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <CalendarDays className="mt-1 shrink-0 text-slate-400" size={18} />
      </div>
      {children}
    </section>
  )
}

function DataState({ loading, empty, children }) {
  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-md border border-dashed border-slate-200 text-sm text-slate-500">
        Memuat data...
      </div>
    )
  }

  if (empty) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-md border border-dashed border-slate-200 text-sm text-slate-500">
        Belum ada data.
      </div>
    )
  }

  return children
}

function PurchaseTable({ rows, loading, onDelete, compact = false }) {
  return (
    <DataState loading={loading} empty={!rows.length}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="py-3 pr-4 font-semibold">Tanggal</th>
              <th className="py-3 pr-4 font-semibold">Kategori</th>
              <th className="py-3 pr-4 font-semibold">Item</th>
              {!compact && (
                <th className="py-3 pr-4 text-right font-semibold">Harga</th>
              )}
              <th className="py-3 pr-4 text-right font-semibold">Qty</th>
              {!compact && (
                <th className="py-3 pr-4 text-right font-semibold">Total</th>
              )}
              {onDelete && <th className="py-3 text-right font-semibold">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="whitespace-nowrap py-3 pr-4 text-slate-600">
                  {formatDate(row.tanggal)}
                </td>
                <td className="py-3 pr-4 text-slate-600">{row.kategori}</td>
                <td className="min-w-48 py-3 pr-4 font-medium text-slate-950">
                  {row.item}
                </td>
                {!compact && (
                  <td className="py-3 pr-4 text-right">
                    {formatCurrency(row.harga)}
                  </td>
                )}
                <td className="py-3 pr-4 text-right font-semibold">{row.qty}</td>
                {!compact && (
                  <td className="py-3 pr-4 text-right">
                    {formatCurrency(Number(row.harga) * Number(row.qty))}
                  </td>
                )}
                {onDelete && <DeleteCell row={row} onDelete={onDelete} />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataState>
  )
}

function SaleTable({ rows, loading, onDelete, compact = false }) {
  return (
    <DataState loading={loading} empty={!rows.length}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="py-3 pr-4 font-semibold">Tanggal</th>
              <th className="py-3 pr-4 font-semibold">Item</th>
              {!compact && (
                <th className="py-3 pr-4 text-right font-semibold">Harga</th>
              )}
              <th className="py-3 pr-4 text-right font-semibold">Qty</th>
              {!compact && (
                <th className="py-3 pr-4 text-right font-semibold">Total</th>
              )}
              {onDelete && <th className="py-3 text-right font-semibold">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="whitespace-nowrap py-3 pr-4 text-slate-600">
                  {formatDate(row.tanggal)}
                </td>
                <td className="min-w-48 py-3 pr-4 font-medium text-slate-950">
                  {row.item}
                </td>
                {!compact && (
                  <td className="py-3 pr-4 text-right">
                    {formatCurrency(row.harga)}
                  </td>
                )}
                <td className="py-3 pr-4 text-right font-semibold">{row.qty}</td>
                {!compact && (
                  <td className="py-3 pr-4 text-right">
                    {formatCurrency(Number(row.harga) * Number(row.qty))}
                  </td>
                )}
                {onDelete && <DeleteCell row={row} onDelete={onDelete} />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataState>
  )
}

function DeleteCell({ row, onDelete }) {
  return (
    <td className="py-3 text-right">
      <button
        type="button"
        onClick={() => onDelete(row.id)}
        className="inline-flex size-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        aria-label={`Hapus ${row.item}`}
        title="Hapus"
      >
        <Trash2 size={16} />
      </button>
    </td>
  )
}

export default App
