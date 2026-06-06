import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Spinner from '../components/Spinner'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Spinner className="min-h-screen" />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
