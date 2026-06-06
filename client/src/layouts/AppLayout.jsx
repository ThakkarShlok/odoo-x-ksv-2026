import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Building2,
  CheckCircle2,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Receipt,
  Search,
} from 'lucide-react'
import useAuth from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import Badge from '../components/Badge'

const navItems = {
  PROCUREMENT_OFFICER: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Vendors', path: '/vendors', icon: Building2 },
    { label: 'RFQs', path: '/rfqs', icon: FileText },
    { label: 'Quotations', path: '/quotations', icon: MessageSquare },
    { label: 'Approvals', path: '/approvals', icon: CheckCircle2 },
    { label: 'Purchase Orders', path: '/pos', icon: Package },
    { label: 'Invoices', path: '/invoices', icon: Receipt },
    { label: 'Activity Log', path: '/activity', icon: History },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Vendors', path: '/vendors', icon: Building2 },
    { label: 'RFQs', path: '/rfqs', icon: FileText },
    { label: 'Quotations', path: '/quotations', icon: MessageSquare },
    { label: 'Approvals', path: '/approvals', icon: CheckCircle2 },
    { label: 'Purchase Orders', path: '/pos', icon: Package },
    { label: 'Invoices', path: '/invoices', icon: Receipt },
    { label: 'Activity Log', path: '/activity', icon: History },
  ],
  MANAGER: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Approvals', path: '/approvals', icon: CheckCircle2, showPending: true },
    { label: 'Purchase Orders', path: '/pos', icon: Package },
    { label: 'Invoices', path: '/invoices', icon: Receipt },
    { label: 'Activity Log', path: '/activity', icon: History },
  ],
  VENDOR: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My RFQs', path: '/my-rfqs', icon: FileText },
    { label: 'My Quotations', path: '/my-quotations', icon: MessageSquare },
    { label: 'My Purchase Orders', path: '/my-pos', icon: Package },
    { label: 'My Invoices', path: '/my-invoices', icon: Receipt },
    { label: 'Activity Log', path: '/activity', icon: History },
  ],
}

const titleMap = {
  '/dashboard': 'Dashboard',
  '/vendors': 'Vendors',
  '/rfqs': 'RFQs',
  '/rfqs/new': 'Create RFQ',
  '/quotations': 'Quotations',
  '/approvals': 'Approvals',
  '/pos': 'Purchase Orders',
  '/invoices': 'Invoices',
  '/activity': 'Activity Log',
  '/my-rfqs': 'My RFQs',
  '/my-quotations': 'My Quotations',
  '/my-pos': 'My Purchase Orders',
  '/my-invoices': 'My Invoices',
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'VB'
}

function getPageTitle(pathname) {
  if (titleMap[pathname]) return titleMap[pathname]
  if (pathname.startsWith('/rfqs/') && pathname.endsWith('/compare')) return 'Compare Quotations'
  if (pathname.startsWith('/rfqs/')) return 'RFQ Details'
  if (pathname.startsWith('/my-rfqs/') && pathname.endsWith('/quote')) return 'Submit Quotation'
  return 'VendorBridge'
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { data } = useFetch('/api/dashboard/summary')
  const pendingApprovals = data?.pendingApprovals || 0
  const items = navItems[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-700">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="flex h-16 items-center gap-2 px-6">
          <Building2 className="h-6 w-6 text-teal-700" />
          <Link to="/dashboard" className="text-xl font-bold text-teal-700">
            VendorBridge
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-r-lg border-l-4 p-3 text-sm transition-colors ${
                    isActive
                      ? 'border-teal-600 bg-teal-50 font-medium text-teal-700'
                      : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="flex-1">{item.label}</span>
                {item.showPending && pendingApprovals > 0 && (
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-700">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
                <Badge label={user?.role?.replaceAll('_', ' ')} color="teal" className="mt-1" />
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="ml-64 flex h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {getPageTitle(location.pathname)}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-9 w-64 rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                placeholder="Search records"
                type="search"
              />
            </div>
            <button
              type="button"
              className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {pendingApprovals > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
