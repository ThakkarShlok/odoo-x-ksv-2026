import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { ArrowLeft, Clock, GitCompareArrows, Package, Send, XCircle } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import axiosInstance from '../utils/axiosInstance'
import { formatCurrency, formatStatus } from '../utils/formatters'
import Badge, { statusToColor } from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'

export default function RFQDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [generatingPOId, setGeneratingPOId] = useState(null)
  const canManage = user?.role === 'PROCUREMENT_OFFICER'
  const { data, loading, error, refetch } = useFetch(`/api/rfqs/${id}`)
  const {
    data: quotationData,
    loading: quotationsLoading,
    error: quotationsError,
  } = useFetch(`/api/rfqs/${id}/quotations`)
  const { data: poData, refetch: refetchPOs } = useFetch('/api/pos')
  const rfq = data?.rfq
  const quotations = quotationData?.quotations || rfq?.quotations || []
  const quotedVendorIds = new Set(quotations.map((quotation) => quotation.vendorId))
  const poQuotationIds = new Set((poData?.pos || []).map((po) => po.quotationId))

  const handlePublish = async () => {
    try {
      await axiosInstance.put(`/api/rfqs/${id}/publish`)
      toast.success('RFQ published')
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to publish RFQ')
    }
  }

  const handleClose = async () => {
    try {
      await axiosInstance.put(`/api/rfqs/${id}/close`)
      toast.success('RFQ closed')
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to close RFQ')
    }
  }

  const handleGeneratePO = async (quotation) => {
    setGeneratingPOId(quotation.id)
    try {
      await axiosInstance.post(`/api/pos/from-quotation/${quotation.id}`)
      toast.success('Purchase order generated')
      refetchPOs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to generate purchase order')
    } finally {
      setGeneratingPOId(null)
    }
  }

  if (loading) {
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

  if (!rfq) {
    return <EmptyState title="RFQ not found" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button type="button" variant="ghost" size="sm" className="mb-3 gap-2" onClick={() => navigate('/rfqs')}>
            <ArrowLeft className="h-4 w-4" />
            Back to RFQs
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm font-medium text-teal-700">{rfq.rfqNumber}</span>
            <Badge label={formatStatus(rfq.status)} color={statusToColor(rfq.status)} />
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{rfq.title}</h2>
          {rfq.description && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{rfq.description}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Deadline {format(new Date(rfq.deadline), 'MMM d, yyyy')}
            </span>
            <span>Created {formatDistanceToNow(new Date(rfq.createdAt), { addSuffix: true })}</span>
            {rfq.createdBy && <span>By {rfq.createdBy.name}</span>}
          </div>
        </div>

        {canManage && (
          <div className="flex gap-3">
            {rfq.status === 'DRAFT' && (
              <Button type="button" className="gap-2" onClick={handlePublish}>
                <Send className="h-4 w-4" />
                Publish
              </Button>
            )}
            {rfq.status === 'PUBLISHED' && (
              <Button type="button" variant="secondary" className="gap-2" onClick={handleClose}>
                <XCircle className="h-4 w-4" />
                Close RFQ
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div className="space-y-6">
          <Card>
            <h3 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Items</h3>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 text-right font-medium">Quantity</th>
                    <th className="px-4 py-3 font-medium">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rfq.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.productName}</td>
                      <td className="px-4 py-3 text-slate-600">{item.description || '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-slate-600">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Invited Vendors</h3>
            <div className="flex flex-wrap gap-2">
              {rfq.vendors.map((invite) => {
                const hasQuoted = quotedVendorIds.has(invite.vendorId)
                return (
                  <span
                    key={invite.id}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200"
                  >
                    {invite.vendor.name}
                    <Badge label={hasQuoted ? 'quoted' : 'invited'} color={hasQuoted ? 'emerald' : 'amber'} />
                  </span>
                )
              })}
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">Quotations Received</h3>
              <p className="mt-1 text-sm text-slate-500">{quotations.length} vendor responses</p>
            </div>
            {quotations.length >= 2 && (
              <Link to={`/rfqs/${rfq.id}/compare`}>
                <Button type="button" variant="accent" size="sm" className="gap-2">
                  <GitCompareArrows className="h-4 w-4" />
                  Compare All
                </Button>
              </Link>
            )}
          </div>

          {quotationsLoading ? (
            <Spinner className="py-10" />
          ) : quotationsError ? (
            <p className="text-sm text-rose-600">{quotationsError}</p>
          ) : quotations.length ? (
            <div className="space-y-3">
              {quotations.map((quotation) => (
                <div key={quotation.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{quotation.vendor?.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{quotation.deliveryDays} delivery days</p>
                    </div>
                    <Badge label={formatStatus(quotation.status)} color={statusToColor(quotation.status)} />
                  </div>
                  <p className="mt-4 text-xl font-semibold tabular-nums text-teal-700">
                    {formatCurrency(quotation.totalAmount)}
                  </p>
                  <Link to={`/rfqs/${rfq.id}/compare`} className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline">
                    View Details
                  </Link>
                  {canManage && quotation.status === 'APPROVED' && !poQuotationIds.has(quotation.id) && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      loading={generatingPOId === quotation.id}
                      className="mt-3 w-full gap-2"
                      onClick={() => handleGeneratePO(quotation)}
                    >
                      <Package className="h-4 w-4" />
                      Generate Purchase Order
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Waiting for vendor responses" description="Submitted quotations will appear here." />
          )}
        </Card>
      </div>
    </div>
  )
}
