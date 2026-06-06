import { Link } from 'react-router-dom'
import { differenceInCalendarDays, format } from 'date-fns'
import { Clock, FileText, Send } from 'lucide-react'
import useFetch from '../hooks/useFetch'
import { formatStatus } from '../utils/formatters'
import Badge, { statusToColor } from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'

function deadlineLabel(deadline) {
  const days = differenceInCalendarDays(new Date(deadline), new Date())
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

export default function VendorMyRFQsPage() {
  const { data, loading, error } = useFetch('/api/rfqs')
  const {
    data: quotationData,
    loading: quotationsLoading,
  } = useFetch('/api/quotations')
  const rfqs = data?.rfqs || []
  const quotationRfqIds = new Set((quotationData?.quotations || []).map((quotation) => quotation.rfqId))

  if (loading || quotationsLoading) {
    return (
      <Card>
        <Spinner className="py-16" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-rose-600">{error}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">My RFQs</h2>
        <p className="mt-1 text-sm text-slate-500">RFQs your vendor account has been invited to quote.</p>
      </div>

      {rfqs.length ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rfqs.map((rfq) => {
            const hasQuotation = quotationRfqIds.has(rfq.id)
            const canQuote = rfq.status === 'PUBLISHED' && !hasQuotation
            const itemCount = rfq.items?.length ?? rfq._count?.items

            return (
              <Card key={rfq.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-sm font-medium text-teal-700">{rfq.rfqNumber}</span>
                  <Badge label={formatStatus(rfq.status)} color={statusToColor(rfq.status)} />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">{rfq.title}</h3>
                {rfq.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{rfq.description}</p>
                )}

                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  <p className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {deadlineLabel(rfq.deadline)}
                    <span className="text-slate-400">({format(new Date(rfq.deadline), 'MMM d')})</span>
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    {itemCount ? `${itemCount} items` : 'Items available in details'}
                  </p>
                </div>

                <div className="mt-6 flex flex-1 items-end">
                  {canQuote ? (
                    <Link to={`/my-rfqs/${rfq.id}/quote`} className="w-full">
                      <Button type="button" variant="accent" className="w-full gap-2">
                        <Send className="h-4 w-4" />
                        Submit Quotation
                      </Button>
                    </Link>
                  ) : (
                    <Button type="button" variant="secondary" className="w-full" disabled>
                      {hasQuotation ? 'Quotation Submitted' : 'Not Open for Quotation'}
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <EmptyState title="No RFQs assigned" description="Invited RFQs will appear here when procurement publishes them." />
        </Card>
      )}
    </div>
  )
}
