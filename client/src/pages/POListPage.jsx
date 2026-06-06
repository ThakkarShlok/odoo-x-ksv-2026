import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { FilePlus2 } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import axiosInstance from '../utils/axiosInstance'
import { formatCurrency, formatStatus } from '../utils/formatters'
import Badge, { statusToColor } from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'

export default function POListPage() {
  const { user } = useAuth()
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState(null)
  const { data, loading, error, refetch } = useFetch('/api/pos')
  const {
    data: invoiceData,
    loading: invoicesLoading,
    refetch: refetchInvoices,
  } = useFetch('/api/invoices')
  const pos = data?.pos || []
  const invoicePoIds = new Set((invoiceData?.invoices || []).map((invoice) => invoice.poId))
  const canGenerateInvoice = user?.role === 'PROCUREMENT_OFFICER'

  const handleGenerateInvoice = async (po) => {
    setGeneratingInvoiceId(po.id)
    try {
      await axiosInstance.post(`/api/invoices/from-po/${po.id}`)
      toast.success('Invoice generated')
      refetch()
      refetchInvoices()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to generate invoice')
    } finally {
      setGeneratingInvoiceId(null)
    }
  }

  const columns = [
    {
      key: 'poNumber',
      label: 'PO #',
      render: (value) => <span className="font-mono text-sm font-medium text-teal-700">{value}</span>,
    },
    {
      key: 'quotation',
      label: 'Quotation #',
      render: (_value, row) => (
        <div>
          <p className="font-mono text-sm text-slate-900">{row.quotation?.quotationNumber}</p>
          <p className="text-xs text-slate-500">{row.quotation?.rfq?.title}</p>
        </div>
      ),
    },
    {
      key: 'vendor',
      label: 'Vendor',
      render: (_value, row) => row.quotation?.vendor?.name || '—',
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      render: (value) => (
        <span className="font-semibold tabular-nums text-slate-900">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <Badge label={formatStatus(value)} color={statusToColor(value)} />,
    },
    {
      key: 'issuedAt',
      label: 'Issued At',
      render: (value) => (
        <div>
          <p className="text-slate-700">{format(new Date(value), 'MMM d, yyyy')}</p>
          <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(value), { addSuffix: true })}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => {
        const hasInvoice = invoicePoIds.has(row.id)
        if (!canGenerateInvoice) {
          return <span className="text-sm text-slate-400">View only</span>
        }
        if (hasInvoice) {
          return <Badge label="Invoice Generated" color="emerald" />
        }
        return (
          <Button
            type="button"
            variant="accent"
            size="sm"
            loading={generatingInvoiceId === row.id}
            className="gap-2"
            onClick={() => handleGenerateInvoice(row)}
          >
            <FilePlus2 className="h-4 w-4" />
            Generate Invoice
          </Button>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Purchase Orders</h2>
        <p className="mt-1 text-sm text-slate-500">
          Review issued purchase orders and generate invoices for completed approvals.
        </p>
      </div>

      <Card>
        {loading || invoicesLoading ? (
          <Spinner className="py-16" />
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : pos.length ? (
          <DataTable columns={columns} data={pos} searchable={false} />
        ) : (
          <EmptyState title="No purchase orders" description="Approved quotations can be converted into purchase orders." />
        )}
      </Card>
    </div>
  )
}
