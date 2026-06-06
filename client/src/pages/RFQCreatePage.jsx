import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import useFetch from '../hooks/useFetch'
import axiosInstance from '../utils/axiosInstance'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import Input from '../components/Input'
import Spinner from '../components/Spinner'

const units = ['pcs', 'units', 'kg', 'hours', 'reams']

export default function RFQCreatePage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [submitMode, setSubmitMode] = useState('draft')
  const { data: vendorData, loading: vendorsLoading, error: vendorsError } = useFetch('/api/vendors?isActive=true')
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      deadline: '',
      items: [{ productName: '', description: '', quantity: 1, unit: 'pcs' }],
      vendorIds: [],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const onSubmit = async (values) => {
    setSaving(true)
    try {
      const payload = {
        title: values.title,
        description: values.description,
        deadline: new Date(values.deadline).toISOString(),
        items: values.items.map((item) => ({
          productName: item.productName,
          description: item.description,
          quantity: Number(item.quantity),
          unit: item.unit,
        })),
        vendorIds: values.vendorIds.map((id) => Number(id)),
      }
      const res = await axiosInstance.post('/api/rfqs', payload)
      const rfq = res.data.rfq

      if (submitMode === 'publish') {
        await axiosInstance.put(`/api/rfqs/${rfq.id}/publish`)
        toast.success('RFQ published and vendors invited')
      } else {
        toast.success('RFQ saved as draft')
      }

      navigate(`/rfqs/${rfq.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to create RFQ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">RFQ Details</h2>
          <p className="mt-1 text-sm text-slate-500">Define the requirement and response deadline.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            id="title"
            label="Title"
            error={errors.title?.message}
            {...register('title', { required: 'Title is required' })}
          />
          <Input
            id="deadline"
            label="Deadline"
            type="date"
            error={errors.deadline?.message}
            {...register('deadline', { required: 'Deadline is required' })}
          />
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
            {...register('description')}
          />
        </div>
      </Card>

      <Card>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Line Items</h2>
            <p className="mt-1 text-sm text-slate-500">Add the products or services vendors should quote.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="gap-2"
            onClick={() => append({ productName: '', description: '', quantity: 1, unit: 'pcs' })}
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-4 lg:grid-cols-[1.2fr_1.4fr_0.6fr_0.7fr_auto]">
              <Input
                id={`items.${index}.productName`}
                label="Product"
                error={errors.items?.[index]?.productName?.message}
                {...register(`items.${index}.productName`, { required: 'Required' })}
              />
              <Input
                id={`items.${index}.description`}
                label="Description"
                {...register(`items.${index}.description`)}
              />
              <Input
                id={`items.${index}.quantity`}
                label="Quantity"
                type="number"
                min="1"
                error={errors.items?.[index]?.quantity?.message}
                {...register(`items.${index}.quantity`, {
                  required: 'Required',
                  min: { value: 1, message: 'Min 1' },
                })}
              />
              <div className="flex flex-col gap-1">
                <label htmlFor={`items.${index}.unit`} className="text-sm font-medium text-slate-700">
                  Unit
                </label>
                <select
                  id={`items.${index}.unit`}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                  {...register(`items.${index}.unit`)}
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Invite Vendors</h2>
          <p className="mt-1 text-sm text-slate-500">Select active vendors who should receive this RFQ.</p>
        </div>

        {vendorsLoading ? (
          <Spinner className="py-10" />
        ) : vendorsError ? (
          <p className="text-sm text-rose-600">{vendorsError}</p>
        ) : vendorData?.vendors?.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {vendorData.vendors.map((vendor) => (
              <label
                key={vendor.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-teal-200 hover:bg-teal-50/40"
              >
                <input
                  type="checkbox"
                  value={vendor.id}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  {...register('vendorIds', {
                    validate: (value) => value.length > 0 || 'Select at least one vendor',
                  })}
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">{vendor.name}</span>
                  <span className="block text-xs text-slate-500">{vendor.category}</span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <EmptyState title="No active vendors" description="Add active vendors before creating an RFQ." />
        )}
        {errors.vendorIds && <p className="mt-3 text-sm text-rose-500">{errors.vendorIds.message}</p>}
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" variant="secondary" loading={saving} onClick={() => setSubmitMode('draft')}>
          Save as Draft
        </Button>
        <Button type="submit" variant="accent" loading={saving} onClick={() => setSubmitMode('publish')}>
          Publish & Invite Vendors
        </Button>
      </div>
    </form>
  )
}
