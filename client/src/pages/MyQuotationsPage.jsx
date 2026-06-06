import { format, formatDistanceToNow } from 'date-fns'
import useFetch from '../hooks/useFetch'
import { formatCurrency, formatStatus } from '../utils/formatters'
import Badge, { statusToColor } from '../components/Badge'
import Card from '../components/Card'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'

export default function MyQuotationsPage() {
  const { data, loading, error } = useFetch('/api/quotations')
  const quotations = data?.quotations || []

  const columns = [
    {
      key: 'quotationNumber',
      label: 'Quotation #',
      render: (value) => <span className="font-mono text-sm font-medium text-teal-700">{value}</span>,
    },
    {
      key: 'rfq',
      label: 'RFQ Title',
      render: (_value, row) => (
        <div>
          <p className="font-medium text-slate-900">{row.rfq?.title}</p>
          <p className="text-xs text-slate-500">{row.rfq?.rfqNumber}</p>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      render: (value) => (
        <span className="font-semibold tabular-nums text-slate-900">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'deliveryDays',
      label: 'Delivery Days',
      render: (value) => `${value} days`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <Badge label={formatStatus(value)} color={statusToColor(value)} />,
    },
    {
      key: 'submittedAt',
      label: 'Submitted At',
      render: (value) => (
        <div>
          <p className="text-slate-700">{format(new Date(value), 'MMM d, yyyy')}</p>
          <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(value), { addSuffix: true })}</p>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">My Quotations</h2>
        <p className="mt-1 text-sm text-slate-500">Track submitted quotations and approval status.</p>
      </div>

      <Card>
        {loading ? (
          <Spinner className="py-16" />
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : quotations.length ? (
          <DataTable columns={columns} data={quotations} searchable={false} />
        ) : (
          <EmptyState title="No quotations submitted" description="Submitted vendor quotations will appear here." />
        )}
      </Card>
    </div>
  )
}
