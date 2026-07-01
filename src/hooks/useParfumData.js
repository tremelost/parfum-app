import { useCallback, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { getLocalRows } from '../utils/format'

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

/**
 * Custom hook that encapsulates all parfum data state & logic.
 * Used by Layout and consumed by pages via Outlet context.
 */
export default function useParfumData() {
  const [purchases, setPurchases] = useState([])
  const [sales, setSales] = useState([])
  const [purchaseForm, setPurchaseForm] = useState(emptyPurchaseForm)
  const [saleForm, setSaleForm] = useState(emptySaleForm)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingPurchase, setSavingPurchase] = useState(false)
  const [savingSale, setSavingSale] = useState(false)
  const [notice, setNotice] = useState('')

  const loadData = useCallback(async () => {
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
  }, [])

  // Initial data load
  useEffect(() => {
    loadData()
  }, [loadData])

  // Supabase realtime subscriptions
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
  }, [loadData])

  // Persist to localStorage in demo mode
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

  // Filtered data
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

  // Stock calculations
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

  // Summary stats
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

  // Form handlers
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

  return {
    // Data
    purchases,
    sales,
    filteredPurchases,
    filteredSales,
    stockRows,
    stats,
    loading,
    notice,

    // Search
    search,
    setSearch,

    // Purchase form
    purchaseForm,
    setPurchaseForm,
    handlePurchaseSubmit,
    savingPurchase,

    // Sale form
    saleForm,
    setSaleForm,
    handleSaleSubmit,
    savingSale,

    // Actions
    deletePurchase,
    deleteSale,
    loadData,
  }
}
