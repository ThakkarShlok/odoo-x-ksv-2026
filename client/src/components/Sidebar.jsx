export default function Sidebar({ children }) {
  return (
    <aside className="h-full w-64 border-r border-gray-200 bg-white px-4 py-6 flex flex-col gap-2">
      {children}
    </aside>
  )
}
