import { formatCurrency, formatDate } from '../utils/format'
import DataState from './DataState'
import DeleteCell from './DeleteCell'
import { Printer } from 'lucide-react'

export default function SaleTable({ rows, loading, onDelete, onPrint, compact = false }) {
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
              {(onDelete || onPrint) && <th className="py-3 text-right font-semibold">Aksi</th>}
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
                {(onDelete || onPrint) && (
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onPrint && (
                        <button
                          type="button"
                          onClick={() => onPrint(row)}
                          className="inline-flex size-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600"
                          aria-label={`Cetak invoice ${row.item}`}
                          title="Cetak Invoice"
                        >
                          <Printer size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <DeleteCell row={row} onDelete={onDelete} isNested={true} />
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataState>
  )
}
