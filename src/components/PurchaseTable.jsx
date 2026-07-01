import { formatCurrency, formatDate } from '../utils/format'
import DataState from './DataState'
import DeleteCell from './DeleteCell'

export default function PurchaseTable({ rows, loading, onDelete, compact = false }) {
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
