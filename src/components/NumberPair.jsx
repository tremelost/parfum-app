export default function NumberPair({ harga, qty, onHargaChange, onQtyChange }) {
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
