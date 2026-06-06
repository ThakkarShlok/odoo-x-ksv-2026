/* eslint-disable react-refresh/only-export-components */

const colorMap = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  rose: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  teal: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
  slate: 'bg-slate-50 text-slate-700 ring-1 ring-slate-200',
}

export function statusToColor(status) {
  if (['APPROVED', 'ISSUED', 'PAID', 'PUBLISHED', 'FULFILLED'].includes(status)) {
    return 'emerald'
  }
  if (['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'DRAFT'].includes(status)) {
    return 'amber'
  }
  if (['REJECTED', 'CANCELLED'].includes(status)) {
    return 'rose'
  }
  return 'slate'
}

export default function Badge({ label, color = 'slate', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
        ${colorMap[color] ?? colorMap.slate} ${className}`}
    >
      {label}
    </span>
  )
}
