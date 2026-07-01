import { useOutletContext } from 'react-router-dom'
import Panel from '../components/Panel'
import PurchaseTable from '../components/PurchaseTable'
import DateField from '../components/DateField'
import TextField from '../components/TextField'
import NumberPair from '../components/NumberPair'
import SubmitButton from '../components/SubmitButton'

export default function PurchasePage() {
  const {
    purchaseForm,
    setPurchaseForm,
    filteredPurchases,
    savingPurchase,
    loading,
    handlePurchaseSubmit,
    deletePurchase,
  } = useOutletContext()

  const updateForm = (field, value) => {
    setPurchaseForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <Panel title="Input pembelian" subtitle="Catat belanja manual supplier">
        <form className="grid gap-4" onSubmit={handlePurchaseSubmit}>
          <DateField value={purchaseForm.tanggal} onChange={(value) => updateForm('tanggal', value)} />

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Kategori
            <select
              value={purchaseForm.kategori}
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
            value={purchaseForm.item}
            onChange={(value) => updateForm('item', value)}
            placeholder="Nama parfum atau bahan"
          />

          <NumberPair
            harga={purchaseForm.harga}
            qty={purchaseForm.qty}
            onHargaChange={(value) => updateForm('harga', value)}
            onQtyChange={(value) => updateForm('qty', value)}
          />

          <SubmitButton saving={savingPurchase} label="Simpan pembelian" />
        </form>
      </Panel>

      <Panel title="Data pembelian manual" subtitle="Database: id, tanggal, kategori, item, harga, qty">
        <PurchaseTable rows={filteredPurchases} loading={loading} onDelete={deletePurchase} />
      </Panel>
    </div>
  )
}
