import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Send } from 'lucide-react'
import useFetch from '../hooks/useFetch'
import axiosInstance from '../utils/axiosInstance'
import { formatCurrency } from '../utils/formatters'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Spinner from '../components/Spinner'

export default function VendorQuotationSubmitPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const { data, loading, error } = useFetch(`/api/rfqs/${id}`)
  const rfq = data?.rfq
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      items: [],
      deliveryDays: '',
      notes: '',
    },
  })
  // eslint-disable-next-line react-hooks/incompatible-library
  const items = watch('items')

  useEffect(() => {
    if (!rfq) return
    reset({
      items: rfq.items.map((item) => ({
        productName: item.productName,
        description: item.description || '',
        quantity: item.quantity,
        unitPrice: '',
      })),
      deliveryDays: '',
      notes: '',
    })
  }, [rfq, reset])

  const grandTotal = (items || []).reduce((sum, item) => {
    const quantity = Number(item.quantity || 0)
    const unitPrice = Number(item.unitPrice || 0)
    return sum + quantity * unitPrice
  }, 0)

  const onSubmit = async (values) => {
    setSubmitting(true)
    try {
      await axiosInstance.post('/api/quotations', {
        rfqId: Number(id),
        deliveryDays: Number(values.deliveryDays),
        notes: values.notes,
        items: values.items.map((item) => ({
          productName: item.productName,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      })
      toast.success('Quotation submitted')
      navigate('/my-quotations')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to submit quotation')
    } finally {
      setSubmitting(false)
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
    return (
      <Card>
        <p className="text-sm text-slate-600">RFQ not found.</p>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Button type="button" variant="ghost" size="sm" className="mb-3 gap-2" onClick={() => navigate('/my-rfqs')}>
          <ArrowLeft className="h-4 w-4" />
          Back to My RFQs
        </Button>
        <p className="font-mono text-sm font-medium text-teal-700">{rfq.rfqNumber}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{rfq.title}</h2>
        {rfq.description && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">{rfq.description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
        <div className="space-y-4">
          {rfq.items.map((item, index) => {
            const quantity = Number(items?.[index]?.quantity || item.quantity || 0)
            const unitPrice = Number(items?.[index]?.unitPrice || 0)
            const rowTotal = quantity * unitPrice

            return (
              <Card key={item.id}>
                <input type="hidden" {...register(`items.${index}.productName`)} />
                <input type="hidden" {...register(`items.${index}.quantity`)} />
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.7fr_0.8fr_0.8fr]">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.productName}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.description || 'No description provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Quantity</label>
                    <div className="mt-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium tabular-nums text-slate-700">
                      {item.quantity}
                    </div>
                  </div>
                  <Input
                    id={`items.${index}.unitPrice`}
                    label="Unit Price"
                    type="number"
                    min="0"
                    step="0.01"
                    error={errors.items?.[index]?.unitPrice?.message}
                    {...register(`items.${index}.unitPrice`, {
                      required: 'Required',
                      min: { value: 0, message: 'Must be positive' },
                    })}
                  />
                  <div>
                    <label className="text-sm font-medium text-slate-700">Total</label>
                    <div className="mt-1 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-semibold tabular-nums text-teal-700">
                      {formatCurrency(rowTotal)}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}

          <Card>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                id="deliveryDays"
                label="Delivery Days"
                type="number"
                min="1"
                error={errors.deliveryDays?.message}
                {...register('deliveryDays', {
                  required: 'Delivery days are required',
                  min: { value: 1, message: 'Minimum 1 day' },
                })}
              />
              <div className="flex flex-col gap-1 md:col-span-2">
                <label htmlFor="notes" className="text-sm font-medium text-slate-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                  placeholder="Delivery terms, substitutions, or remarks"
                  {...register('notes')}
                />
              </div>
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Card>
            <p className="text-sm font-medium text-slate-500">Quotation Summary</p>
            <p className="mt-3 text-4xl font-semibold tabular-nums tracking-tight text-teal-700">
              {formatCurrency(grandTotal)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Updates live as unit prices change.
            </p>
            <Button type="submit" variant="accent" loading={submitting} className="mt-6 w-full gap-2">
              <Send className="h-4 w-4" />
              Submit Quotation
            </Button>
          </Card>
        </aside>
      </div>
    </form>
  )
}
