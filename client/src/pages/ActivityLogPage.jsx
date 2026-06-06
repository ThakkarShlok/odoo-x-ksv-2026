import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import {
  CheckCircle2,
  Clock,
  FileText,
  Send,
  XCircle,
} from 'lucide-react'
import useFetch from '../hooks/useFetch'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'

function actionTone(action = '') {
  if (action.includes('APPROVE')) return 'emerald'
  if (action.includes('REJECT') || action.includes('DELETE')) return 'rose'
  if (action.includes('CREATE') || action.includes('PUBLISH')) return 'teal'
  if (action.includes('SUBMIT') || action.includes('REVIEW')) return 'amber'
  return 'slate'
}

function actionIcon(action = '') {
  if (action.includes('APPROVE')) return CheckCircle2
  if (action.includes('REJECT') || action.includes('DELETE')) return XCircle
  if (action.includes('SUBMIT') || action.includes('PUBLISH')) return Send
  return FileText
}

function toneClasses(tone) {
  const map = {
    teal: 'bg-teal-600 ring-teal-100',
    emerald: 'bg-emerald-600 ring-emerald-100',
    rose: 'bg-rose-600 ring-rose-100',
    amber: 'bg-amber-500 ring-amber-100',
    slate: 'bg-slate-500 ring-slate-100',
  }
  return map[tone] || map.slate
}

function verbClasses(tone) {
  const map = {
    teal: 'text-teal-700',
    emerald: 'text-emerald-700',
    rose: 'text-rose-700',
    amber: 'text-amber-700',
    slate: 'text-slate-700',
  }
  return map[tone] || map.slate
}

function entityReference(log) {
  const metadata = log.metadata || {}
  return (
    metadata.rfqNumber ||
    metadata.quotationNumber ||
    metadata.poNumber ||
    metadata.invoiceNumber ||
    metadata.name ||
    `${log.entityType} #${log.entityId}`
  )
}

function dateGroupLabel(date) {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMM d, yyyy')
}

function groupLogs(logs) {
  return logs.reduce((groups, log) => {
    const label = dateGroupLabel(new Date(log.createdAt))
    if (!groups[label]) groups[label] = []
    groups[label].push(log)
    return groups
  }, {})
}

export default function ActivityLogPage() {
  const { data, loading, error } = useFetch('/api/activity?limit=50')
  const logs = data?.logs || []
  const grouped = groupLogs(logs)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Activity Log</h2>
        <p className="mt-1 text-sm text-slate-500">
          Audit trail for RFQs, quotations, approvals, purchase orders, and invoices.
        </p>
      </div>

      <Card>
        {loading ? (
          <Spinner className="py-16" />
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : logs.length ? (
          <div className="space-y-8">
            {Object.entries(grouped).map(([date, dateLogs]) => (
              <section key={date}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {date}
                </h3>
                <ol className="relative space-y-5 border-l border-slate-200 pl-6">
                  {dateLogs.map((log) => {
                    const tone = actionTone(log.action)
                    const Icon = actionIcon(log.action)
                    return (
                      <li key={log.id} className="relative">
                        <span className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ${toneClasses(tone)}`} />
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm text-slate-700">
                                <span className={`font-semibold ${verbClasses(tone)}`}>
                                  {log.action.replaceAll('_', ' ')}
                                </span>
                                <span className="mx-1 text-slate-400">·</span>
                                <span className="font-medium text-slate-900">{entityReference(log)}</span>
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {log.user?.name || 'System'} changed {log.entityType}
                              </p>
                            </div>
                            <p className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-500">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                            <Icon className="h-3.5 w-3.5" />
                            {log.entityType}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState title="No activity recorded" description="User actions will appear here as the workflow progresses." />
        )}
      </Card>
    </div>
  )
}
