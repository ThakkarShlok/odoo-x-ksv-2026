import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import {
  Building2,
  CheckCircle2,
  Clock,
  FilePlus2,
  FileText,
  History,
  Inbox,
  Package,
  Receipt,
  Send,
} from 'lucide-react'
import useAuth from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'

const statMeta = [
  {
    key: 'activeRFQs',
    label: 'Active RFQs',
    icon: FileText,
    primary: true,
  },
  {
    key: 'pendingApprovals',
    label: 'Pending Approvals',
    icon: CheckCircle2,
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    key: 'recentPOs',
    label: 'Recent POs',
    icon: Package,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    key: 'recentInvoices',
    label: 'Recent Invoices',
    icon: Receipt,
    iconClass: 'bg-teal-50 text-teal-600',
  },
  {
    key: 'totalVendors',
    label: 'Total Vendors',
    icon: Building2,
    iconClass: 'bg-slate-100 text-slate-600',
  },
]

const actionMap = {
  PROCUREMENT_OFFICER: [
    { label: 'Create RFQ', path: '/rfqs/new', icon: FilePlus2, variant: 'primary' },
    { label: 'Review Approvals', path: '/approvals', icon: CheckCircle2, variant: 'secondary' },
    { label: 'View Vendors', path: '/vendors', icon: Building2, variant: 'secondary' },
  ],
  ADMIN: [
    { label: 'View Vendors', path: '/vendors', icon: Building2, variant: 'primary' },
    { label: 'Review Activity', path: '/activity', icon: History, variant: 'secondary' },
    { label: 'View Invoices', path: '/invoices', icon: Receipt, variant: 'secondary' },
  ],
  MANAGER: [
    { label: 'Review Approvals', path: '/approvals', icon: CheckCircle2, variant: 'primary' },
    { label: 'View Purchase Orders', path: '/pos', icon: Package, variant: 'secondary' },
    { label: 'View Activity', path: '/activity', icon: History, variant: 'secondary' },
  ],
  VENDOR: [
    { label: 'Submit Quotation', path: '/my-rfqs', icon: Send, variant: 'primary' },
    { label: 'My Quotations', path: '/my-quotations', icon: FileText, variant: 'secondary' },
    { label: 'My Invoices', path: '/my-invoices', icon: Receipt, variant: 'secondary' },
  ],
}

function ActivityItem({ log }) {
  return (
    <li className="relative pl-8">
      <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-teal-600 ring-4 ring-teal-50" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-slate-900">
          {log.action?.replaceAll('_', ' ')} {log.entityType}
          <span className="ml-1 font-mono text-xs text-teal-700">
            #{log.entityId}
          </span>
        </p>
        <p className="text-xs text-slate-500">
          {log.user?.name || 'System'} · {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
        </p>
      </div>
    </li>
  )
}

function StatCard({ stat, value }) {
  const Icon = stat.icon

  if (stat.primary) {
    return (
      <Card className="border-teal-700 bg-gradient-to-br from-teal-600 to-teal-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-teal-50">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p>
          </div>
          <Icon className="h-6 w-6 text-teal-50" />
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${stat.iconClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
  } = useFetch('/api/dashboard/summary')
  const {
    data: activity,
    loading: activityLoading,
    error: activityError,
  } = useFetch('/api/activity?limit=8')
  const actions = actionMap[user?.role] || []

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm text-slate-500">Welcome back,</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {user?.name || 'VendorBridge User'}
        </h2>
      </section>

      {summaryLoading ? (
        <Card>
          <Spinner className="py-10" />
        </Card>
      ) : summaryError ? (
        <Card>
          <p className="text-sm text-rose-600">{summaryError}</p>
        </Card>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {statMeta.map((stat) => (
            <StatCard key={stat.key} stat={stat} value={summary?.[stat.key] || 0} />
          ))}
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">Recent Activity</h3>
              <p className="mt-1 text-sm text-slate-500">Latest procurement updates across your workspace.</p>
            </div>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>

          {activityLoading ? (
            <Spinner className="py-10" />
          ) : activityError ? (
            <p className="text-sm text-rose-600">{activityError}</p>
          ) : activity?.logs?.length ? (
            <ol className="space-y-5">
              {activity.logs.map((log) => (
                <ActivityItem key={log.id} log={log} />
              ))}
            </ol>
          ) : (
            <EmptyState
              icon={Inbox}
              title="No activity yet"
              description="Actions will appear here as RFQs, quotations, and invoices move forward."
            />
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">Quick Actions</h3>
          <p className="mt-1 text-sm text-slate-500">
            Common next steps for your role.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.path} to={action.path}>
                  <Button variant={action.variant} className="w-full gap-2">
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </Card>
      </section>
    </div>
  )
}
