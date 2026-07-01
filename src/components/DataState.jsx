export default function DataState({ loading, empty, children }) {
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
