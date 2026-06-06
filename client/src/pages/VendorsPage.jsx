import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Edit2, Plus, Search, Star, Trash2 } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import axiosInstance from '../utils/axiosInstance'
import Badge, { statusToColor } from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'

const categories = ['Hardware', 'Electronics', 'Stationery', 'Services', 'Consulting', 'Logistics']

function VendorForm({ vendor, onClose, onSaved }) {
  const [saving, setSaving] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: vendor || {
      name: '',
      contactName: '',
      email: '',
      phone: '',
      gstNumber: '',
      category: 'Hardware',
      address: '',
    },
  })

  const onSubmit = async (values) => {
    setSaving(true)
    try {
      if (vendor) {
        await axiosInstance.put(`/api/vendors/${vendor.id}`, values)
        toast.success('Vendor updated')
      } else {
        await axiosInstance.post('/api/vendors', values)
        toast.success('Vendor created')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save vendor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          id="name"
          label="Vendor Name"
          error={errors.name?.message}
          {...register('name', { required: 'Vendor name is required' })}
        />
        <Input
          id="contactName"
          label="Contact Name"
          error={errors.contactName?.message}
          {...register('contactName', { required: 'Contact name is required' })}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          id="phone"
          label="Phone"
          error={errors.phone?.message}
          {...register('phone', { required: 'Phone is required' })}
        />
        <Input
          id="gstNumber"
          label="GST Number"
          {...register('gstNumber')}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            id="category"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
            {...register('category', { required: 'Category is required' })}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-rose-500">{errors.category.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="address" className="text-sm font-medium text-slate-700">
          Address
        </label>
        <textarea
          id="address"
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
          {...register('address', { required: 'Address is required' })}
        />
        {errors.address && <p className="text-xs text-rose-500">{errors.address.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {vendor ? 'Update Vendor' : 'Add Vendor'}
        </Button>
      </div>
    </form>
  )
}

export default function VendorsPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('')
  const [editingVendor, setEditingVendor] = useState(null)
  const [deleteVendor, setDeleteVendor] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const canManage = ['PROCUREMENT_OFFICER', 'ADMIN'].includes(user?.role)
  const canDelete = user?.role === 'ADMIN'

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), 300)
    return () => window.clearTimeout(id)
  }, [search])

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (category) params.set('category', category)
    return params.toString() ? `/api/vendors?${params.toString()}` : '/api/vendors'
  }, [debouncedSearch, category])

  const { data, loading, error, refetch } = useFetch(query)

  const handleDelete = async () => {
    if (!deleteVendor) return
    setDeleting(true)
    try {
      await axiosInstance.delete(`/api/vendors/${deleteVendor.id}`)
      toast.success('Vendor deactivated')
      setDeleteVendor(null)
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete vendor')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (_value, row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.category}</p>
        </div>
      ),
    },
    {
      key: 'contactName',
      label: 'Contact',
      render: (_value, row) => (
        <div>
          <p className="text-slate-700">{row.contactName}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone' },
    { key: 'gstNumber', label: 'GST', render: (value) => value || '—' },
    {
      key: 'rating',
      label: 'Rating',
      render: (value) => (
        <span className="inline-flex items-center gap-1 font-medium tabular-nums text-slate-700">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          {Number(value || 0).toFixed(1)}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <Badge label={value ? 'Active' : 'Inactive'} color={statusToColor(value ? 'ACTIVE' : 'INACTIVE')} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="px-2"
              onClick={() => {
                setEditingVendor(row)
                setIsFormOpen(true)
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={() => setDeleteVendor(row)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                placeholder="Search vendors, contacts, emails"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          {canManage && (
            <Button
              type="button"
              className="gap-2"
              onClick={() => {
                setEditingVendor(null)
                setIsFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          )}
        </div>
      </Card>

      <Card>
        {loading ? (
          <Spinner className="py-12" />
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : data?.vendors?.length ? (
          <DataTable columns={columns} data={data.vendors} searchable={false} />
        ) : (
          <EmptyState title="No vendors found" description="Try a different search or add a vendor." />
        )}
      </Card>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingVendor ? 'Edit Vendor' : 'Add Vendor'}
        size="xl"
      >
        <VendorForm
          vendor={editingVendor}
          onClose={() => setIsFormOpen(false)}
          onSaved={refetch}
        />
      </Modal>

      <Modal
        isOpen={!!deleteVendor}
        onClose={() => setDeleteVendor(null)}
        title="Deactivate Vendor"
      >
        <p className="text-sm leading-relaxed text-slate-600">
          This will mark {deleteVendor?.name} as inactive. Existing RFQs and quotations remain available.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => setDeleteVendor(null)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" loading={deleting} onClick={handleDelete}>
            Deactivate
          </Button>
        </div>
      </Modal>
    </div>
  )
}
