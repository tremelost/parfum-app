import { Printer, X } from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/format'
import { useEffect } from 'react'

export default function InvoiceModal({ row, onClose }) {
  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  if (!row) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm print:bg-transparent print:p-0">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl print:w-full print:max-w-none print:shadow-none print:rounded-none">
        
        {/* Header - hide on print */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <h2 className="text-xl font-bold text-slate-900">Preview Invoice</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Printer size={16} />
              Cetak
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Content - what actually gets printed */}
        <div className="print-content" id="invoice-content">
          <div className="mb-8 border-b-2 border-slate-200 pb-6 text-center">
            <h1 className="text-3xl font-black uppercase tracking-widest text-teal-700">INVOICE</h1>
            <p className="mt-2 text-sm text-slate-500">Parfum Stock Admin</p>
          </div>

          <div className="mb-8 flex justify-between text-sm">
            <div>
              <p className="font-bold text-slate-900">Ditagihkan Kepada:</p>
              <p className="text-slate-600">Pelanggan Umum</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">No. Invoice: <span className="font-normal text-slate-600">INV-{row.id.substring(0, 8).toUpperCase()}</span></p>
              <p className="font-bold text-slate-900">Tanggal: <span className="font-normal text-slate-600">{formatDate(row.tanggal)}</span></p>
            </div>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-slate-900">
              <tr>
                <th className="py-3 font-bold text-slate-900">Deskripsi Barang</th>
                <th className="py-3 text-center font-bold text-slate-900">Qty</th>
                <th className="py-3 text-right font-bold text-slate-900">Harga</th>
                <th className="py-3 text-right font-bold text-slate-900">Total</th>
              </tr>
            </thead>
            <tbody className="border-b border-slate-200">
              <tr>
                <td className="py-4 text-slate-800">{row.item}</td>
                <td className="py-4 text-center text-slate-800">{row.qty}</td>
                <td className="py-4 text-right text-slate-800">{formatCurrency(row.harga)}</td>
                <td className="py-4 text-right font-semibold text-slate-900">
                  {formatCurrency(Number(row.harga) * Number(row.qty))}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="py-4 text-right font-bold text-slate-900">Total Pembayaran:</td>
                <td className="py-4 text-right text-lg font-black text-teal-700">
                  {formatCurrency(Number(row.harga) * Number(row.qty))}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-16 text-center text-sm text-slate-500">
            <p>Terima kasih atas pembelian Anda!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
