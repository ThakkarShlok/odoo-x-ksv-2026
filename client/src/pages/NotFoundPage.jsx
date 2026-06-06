import { Link } from 'react-router-dom'
import Button from '../components/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <h1 className="text-8xl font-bold text-slate-200">404</h1>
      <p className="text-xl font-semibold text-slate-700 mt-2">Page not found</p>
      <p className="text-slate-500 mt-1 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/dashboard">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  )
}
