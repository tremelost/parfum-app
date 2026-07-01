import { CalendarDays } from 'lucide-react'

export default function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <CalendarDays className="mt-1 shrink-0 text-slate-400" size={18} />
      </div>
      {children}
    </section>
  )
}
