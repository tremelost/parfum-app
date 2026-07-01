import { useOutletContext } from 'react-router-dom'
import {
  BarChart3,
  ClipboardList,
  ShoppingCart,
  WalletCards,
} from 'lucide-react'
import { formatCurrency } from '../utils/format'
import StatCard from '../components/StatCard'
import Panel from '../components/Panel'
import DataState from '../components/DataState'
import PurchaseTable from '../components/PurchaseTable'
import SaleTable from '../components/SaleTable'

export default function DashboardPage() {
  const { stats, stockRows, filteredPurchases, filteredSales, loading } =
    useOutletContext()

  const recentPurchases = filteredPurchases.slice(0, 6)
  const recentSales = filteredSales.slice(0, 6)

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
