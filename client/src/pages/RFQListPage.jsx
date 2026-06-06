import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { Eye, Plus } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import { formatStatus } from '../utils/formatters'
import Badge, { statusToColor } from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'

const filters = ['All', 'DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED']

export default function RFQListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('All')
  const canCreate = user?.role === 'PROCUREMENT_OFFICER'
  const url = status === 'All' ? '/api/rfqs' : `/api/rfqs?status=${status}`
  const { data, loading, error } = useFetch(url)

  const rows = useMemo(() => data?.rfqs || [], [data])

  const columns = [
    {
      key: 'rfqNumber',
      label: 'RFQ #',
      render: (value) => <span className="font-mono text-sm font-medium text-teal-700">{value}</span>,
    },
    {
      key: 'title',
      label: 'Title',
      render: (value) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      key: 'items',
      label: 'Items',
      render: (_value, row) => row.items?.length || row._count?.items || '—',
    },
    {
      key: 'vendors',
      label: 'Vendors Invited',
      render: (_value, row) => row.vendors?.length || row._count?.vendors || '—',
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (value) => format(new Date(value), 'MMM d, yyyy'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <Badge label={formatStatus(value)} color={statusToColor(value)} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => formatDistanceToNow(new Date(value), { addSuffix: true }),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => navigate(`/rfqs/${row.id}`)}
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatus(filter)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                status === filter
                  ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {filter === 'All' ? 'All' : formatStatus(filter)}
            </button>
          ))}
        </div>
        {canCreate && (
          <Button type="button" className="gap-2" onClick={() => navigate('/rfqs/new')}>
            <Plus className="h-4 w-4" />
            Create RFQ
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <Spinner className="py-12" />
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : rows.length ? (
          <DataTable columns={columns} data={rows} searchable={false} />
        ) : (
          <EmptyState title="No RFQs found" description="RFQs matching this status will appear here." />
        )}
      </Card>
    </div>
  )
}
