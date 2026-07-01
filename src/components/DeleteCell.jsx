import { Trash2 } from 'lucide-react'

export default function DeleteCell({ row, onDelete, isNested = false }) {
  const button = (
    <button
      type="button"
      onClick={() => onDelete(row.id)}
      className="inline-flex size-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      aria-label={`Hapus ${row.item}`}
      title="Hapus"
    >
      <Trash2 size={16} />
    </button>
  )

  if (isNested) {
    return button
  }

  return <td className="py-3 text-right">{button}</td>
}
