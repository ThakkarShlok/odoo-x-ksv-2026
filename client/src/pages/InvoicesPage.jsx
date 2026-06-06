import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { Download, Mail } from 'lucide-react'
import useFetch from '../hooks/useFetch'
import axiosInstance from '../utils/axiosInstance'
import { formatCurrency, formatStatus } from '../utils/formatters'
import Badge, { statusToColor } from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'

export default function InvoicesPage() {
  const [downloadingId, setDownloadingId] = useState(null)
  const [emailingId, setEmailingId] = useState(null)
  const { data, loading, error, refetch } = useFetch('/api/invoices')
  const invoices = data?.invoices || []

  const handleDownload = async (invoice) => {
    setDownloadingId(invoice.id)
    try {
      const res = await axiosInstance.get(`/api/invoices/${invoice.id}/pdf`, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${invoice.invoiceNumber}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success('PDF downloaded')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to download PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleSendEmail = async (invoice) => {
    setEmailingId(invoice.id)
    try {
      const response = await axiosInstance.post(`/api/invoices/${invoice.id}/email`)
      if (response.data.previewUrl) {
        toast.success(
          <div>
            Email sent successfully.
            <a
              href={response.data.previewUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-2 text-teal-600 underline"
            >
              Preview
            </a>
          </div>,
          { duration: 8000 },
        )
      } else {
        toast.success('Email sent successfully')
      }
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to send email')
    } finally {
      setEmailingId(null)
    }
  }

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      render: (value) => <span className="font-mono text-sm font-medium text-teal-700">{value}</span>,
    },
    {
      key: 'po',
      label: 'PO #',
      render: (_value, row) => (
        <div>
          <p className="font-mono text-sm text-slate-900">{row.po?.poNumber}</p>
          <p className="text-xs text-slate-500">{row.po?.quotation?.vendor?.name}</p>
        </div>
      ),
    },
    {
      key: 'subtotal',
      label: 'Subtotal',
      render: (value) => <span className="tabular-nums">{formatCurrency(value)}</span>,
    },
    {
      key: 'taxAmount',
      label: 'Tax (18% GST)',
      render: (value) => <span className="tabular-nums">{formatCurrency(value)}</span>,
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
      render: (_value, row) => (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={downloadingId === row.id}
            className="gap-2"
            onClick={() => handleDownload(row)}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={emailingId === row.id}
            className="gap-2"
            onClick={() => handleSendEmail(row)}
          >
            <Mail className="h-4 w-4" />
            Send Email
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Invoices</h2>
        <p className="mt-1 text-sm text-slate-500">
          Download invoice PDFs and send email copies to vendors.
        </p>
      </div>

      <Card>
        {loading ? (
          <Spinner className="py-16" />
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : invoices.length ? (
          <DataTable columns={columns} data={invoices} searchable={false} />
        ) : (
          <EmptyState title="No invoices" description="Generated invoices will appear here." />
        )}
      </Card>
    </div>
  )
}
