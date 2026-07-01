export default function TextField({ label, value, onChange, placeholder }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-md border border-slate-200 px-3 outline-none ring-teal-600/20 focus:border-teal-600 focus:ring-4"
      />
    </label>
  )
}
