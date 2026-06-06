export default function Sidebar({ children }) {
  return (
    <aside className="h-full w-64 border-r border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-6 flex flex-col gap-2">
      {children}
    </aside>
  )
}
