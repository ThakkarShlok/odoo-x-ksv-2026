import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import axiosInstance from '../utils/axiosInstance'
import { formatCurrency } from '../utils/formatters'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'

function DecisionModal({ approval, decision, onClose, onDecided }) {
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { remarks: '' },
  })
  const isApprove = decision === 'APPROVED'

  const onSubmit = async (values) => {
    setSaving(true)
    try {
      await axiosInstance.post(`/api/approvals/${approval.id}/decide`, {
        status: decision,
        remarks: values.remarks,
      })
      toast.success(isApprove ? 'Quotation approved' : 'Quotation rejected')
      reset()
      onDecided()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update approval')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={!!approval}
      onClose={onClose}
      title={isApprove ? 'Approve Quotation' : 'Reject Quotation'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm leading-relaxed text-slate-600">
          {isApprove ? 'Approve' : 'Reject'} the quotation from {approval?.quotation?.vendor?.name}.
        </p>
        <div className="flex flex-col gap-1">
          <label htmlFor="remarks" className="text-sm font-medium text-slate-700">
            Remarks
          </label>
          <textarea
            id="remarks"
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
            placeholder="Optional notes for the audit trail"
            {...register('remarks')}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isApprove ? 'primary' : 'danger'}
            loading={saving}
            className={isApprove ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' : ''}
          >
            {isApprove ? 'Approve' : 'Reject'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function ApprovalsPage() {
  const { user } = useAuth()
  const [activeDecision, setActiveDecision] = useState(null)
  const { data, loading, error, refetch } = useFetch('/api/approvals/pending')
  const approvals = data?.approvals || []

  useEffect(() => {
    if (user?.role !== 'MANAGER') return undefined
    const id = window.setTimeout(() => refetch(), 0)
    return () => window.clearTimeout(id)
  }, [user?.id, user?.role, refetch])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Pending Approvals</h2>
        <p className="mt-1 text-sm text-slate-500">
          Review quotations submitted by procurement for manager decision.
        </p>
      </div>

      {loading ? (
        <Card>
          <Spinner className="py-16" />
        </Card>
      ) : error ? (
        <Card>
          <p className="text-sm text-rose-600">{error}</p>
        </Card>
      ) : approvals.length ? (
        <div className="space-y-4">
          {approvals.map((approval) => {
            const quotation = approval.quotation
            return (
              <Card key={approval.id}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold tracking-tight text-slate-900">
                      {quotation.rfq?.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {quotation.vendor?.name}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="font-semibold tabular-nums text-teal-700">
                        {formatCurrency(quotation.totalAmount)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {quotation.deliveryDays} delivery days
                      </span>
                      <span>
                        Submitted {formatDistanceToNow(new Date(quotation.submittedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 lg:w-40 lg:flex-col">
                    <Button
                      type="button"
                      className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                      onClick={() => setActiveDecision({ approval, decision: 'APPROVED' })}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="flex-1 gap-2"
                      onClick={() => setActiveDecision({ approval, decision: 'REJECTED' })}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={CheckCircle2}
            title="All caught up"
            description="No pending approvals."
          />
        </Card>
      )}

      <DecisionModal
        approval={activeDecision?.approval}
        decision={activeDecision?.decision}
        onClose={() => setActiveDecision(null)}
        onDecided={refetch}
      />
    </div>
  )
}
