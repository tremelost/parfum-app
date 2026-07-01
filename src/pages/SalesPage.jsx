import { useOutletContext } from 'react-router-dom'
import { useState } from 'react'
import Panel from '../components/Panel'
import SaleTable from '../components/SaleTable'
import DateField from '../components/DateField'
import TextField from '../components/TextField'
import NumberPair from '../components/NumberPair'
import SubmitButton from '../components/SubmitButton'
import InvoiceModal from '../components/InvoiceModal'

export default function SalesPage() {
  const {
    saleForm,
    setSaleForm,
    filteredSales,
    savingSale,
    loading,
    handleSaleSubmit,
    deleteSale,
  } = useOutletContext()

  const [invoiceRow, setInvoiceRow] = useState(null)

  const updateForm = (field, value) => {
    setSaleForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Panel title="Input penjualan" subtitle="Catat penjualan manual customer">
          <form className="grid gap-4" onSubmit={handleSaleSubmit}>
            <DateField value={saleForm.tanggal} onChange={(value) => updateForm('tanggal', value)} />
            <TextField
              label="Item"
              value={saleForm.item}
              onChange={(value) => updateForm('item', value)}
              placeholder="Nama parfum yang terjual"
            />
            <NumberPair
              harga={saleForm.harga}
              qty={saleForm.qty}
              onHargaChange={(value) => updateForm('harga', value)}
              onQtyChange={(value) => updateForm('qty', value)}
            />
            <SubmitButton saving={savingSale} label="Simpan penjualan" />
          </form>
        </Panel>

        <Panel title="Data penjualan" subtitle="Database: id, tanggal, item, harga, qty">
          <SaleTable
            rows={filteredSales}
            loading={loading}
            onDelete={deleteSale}
            onPrint={(row) => setInvoiceRow(row)}
          />
        </Panel>
      </div>

      {invoiceRow && (
        <InvoiceModal row={invoiceRow} onClose={() => setInvoiceRow(null)} />
      )}
    </>
  )
}
