import { useOutletContext } from 'react-router-dom'
import { formatCurrency } from '../utils/format'
import Panel from '../components/Panel'
import DataState from '../components/DataState'

export default function StockPage() {
  const { stockRows, loading } = useOutletContext()

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
