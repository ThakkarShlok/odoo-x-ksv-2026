import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { ArrowLeft, Clock, Send, Star } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import axiosInstance from '../utils/axiosInstance'
import { formatCurrency, formatStatus } from '../utils/formatters'
import Badge, { statusToColor } from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'

export default function QuotationComparePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { data: rfqData, loading: rfqLoading } = useFetch(`/api/rfqs/${id}`)
  const {
    data,
    loading,
    error,
    refetch,
  } = useFetch(`/api/rfqs/${id}/quotations`)
  const rfq = rfqData?.rfq
  const quotations = data?.quotations || []
  const lowestQuotationId = quotations[0]?.id
  const shortestDelivery = quotations.length
    ? Math.min(...quotations.map((quotation) => quotation.deliveryDays))
    : null
  const canSubmitApproval = user?.role === 'PROCUREMENT_OFFICER'

  const handleSubmitApproval = async () => {
    if (!selectedQuotation) return
    setSubmitting(true)
    try {
      await axiosInstance.post('/api/approvals', {
        quotationId: selectedQuotation.id,
        approverId: 2,
      })
      toast.success('Quotation sent for approval')
      setSelectedQuotation(null)
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to send for approval')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || rfqLoading) {
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button type="button" variant="ghost" size="sm" className="mb-3 gap-2" onClick={() => navigate(`/rfqs/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
            Back to RFQ
          </Button>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {rfq?.title || 'Compare Quotations'}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {rfq?.deadline && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Deadline {format(new Date(rfq.deadline), 'MMM d, yyyy')}
              </span>
            )}
            <span>{quotations.length} quotations received</span>
          </div>
        </div>
        <Link to={`/rfqs/${id}`}>
          <Button type="button" variant="secondary">
            RFQ Details
          </Button>
        </Link>
      </div>

      {quotations.length ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex min-w-full gap-4">
            {quotations.map((quotation) => {
              const isLowest = quotation.id === lowestQuotationId
              const isShortest = quotation.deliveryDays === shortestDelivery
              const isLocked = ['UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(quotation.status)

              return (
                <Card
                  key={quotation.id}
                  className={`min-w-80 flex-1 transition-transform ${
                    isLowest ? 'scale-[1.02] ring-2 ring-teal-500' : ''
                  }`}
                >
                  <div className="border-b border-slate-200 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{quotation.vendor?.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{quotation.vendor?.category}</p>
                      </div>
                      <Badge label={formatStatus(quotation.status)} color={statusToColor(quotation.status)} />
                    </div>
                    <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {Number(quotation.vendor?.rating || 0).toFixed(1)}
                    </p>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-left text-slate-600">
                        <tr>
                          <th className="px-3 py-2 font-medium">Item</th>
                          <th className="px-3 py-2 text-right font-medium">Qty</th>
                          <th className="px-3 py-2 text-right font-medium">Unit</th>
                          <th className="px-3 py-2 text-right font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {quotation.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2 font-medium text-slate-900">{item.productName}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-700">{item.quantity}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-700">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-900">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500">Total Amount</p>
                      <p className={`mt-1 text-3xl font-bold tabular-nums ${isLowest ? 'text-teal-700' : 'text-slate-900'}`}>
                        {formatCurrency(quotation.totalAmount)}
                      </p>
                    </div>
                    <p className={`inline-flex items-center gap-1.5 text-sm font-medium ${isShortest ? 'text-emerald-700' : 'text-slate-600'}`}>
                      <Clock className="h-4 w-4" />
                      {quotation.deliveryDays} delivery days
                    </p>
                    {quotation.notes && (
                      <p className="text-sm italic leading-relaxed text-slate-500">
                        “{quotation.notes}”
                      </p>
                    )}
                    {canSubmitApproval && (
                      <Button
                        type="button"
                        className="w-full gap-2"
                        disabled={isLocked}
                        onClick={() => setSelectedQuotation(quotation)}
                      >
                        <Send className="h-4 w-4" />
                        {isLocked ? 'Already Submitted' : 'Send for Approval'}
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <Card>
          <EmptyState title="No quotations yet" description="Vendor quotations will appear here for comparison." />
        </Card>
      )}

      <Modal
        isOpen={!!selectedQuotation}
        onClose={() => setSelectedQuotation(null)}
        title="Send for Approval"
      >
        <p className="text-sm leading-relaxed text-slate-600">
          Send {selectedQuotation?.vendor?.name}&apos;s quotation for manager approval.
        </p>
        <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Total Amount</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-teal-700">
            {formatCurrency(selectedQuotation?.totalAmount)}
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => setSelectedQuotation(null)}>
            Cancel
          </Button>
          <Button type="button" loading={submitting} onClick={handleSubmitApproval}>
            Send to Manager
          </Button>
        </div>
      </Modal>
    </div>
  )
}
