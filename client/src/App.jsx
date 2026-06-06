import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import useAuth from './hooks/useAuth'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import VendorsPage from './pages/VendorsPage'
import RFQListPage from './pages/RFQListPage'
import RFQCreatePage from './pages/RFQCreatePage'
import RFQDetailPage from './pages/RFQDetailPage'
import NotFoundPage from './pages/NotFoundPage'

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/rfqs" element={<RFQListPage />} />
            <Route path="/rfqs/new" element={<RFQCreatePage />} />
            <Route path="/rfqs/:id" element={<RFQDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
