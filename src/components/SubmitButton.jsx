import { Plus } from 'lucide-react'

export default function SubmitButton({ saving, label }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Plus size={17} />
      {saving ? 'Menyimpan...' : label}
    </button>
  )
}
