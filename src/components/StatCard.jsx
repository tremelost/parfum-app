export default function StatCard({ title, value, icon: Icon, tone }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <div className={`flex size-10 items-center justify-center rounded-md ${tone}`}>
          <Icon size={20} />
        </div>
      </div>
    </article>
  )
}
