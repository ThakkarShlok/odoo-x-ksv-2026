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
import QuotationComparePage from './pages/QuotationComparePage'
import ApprovalsPage from './pages/ApprovalsPage'
import VendorMyRFQsPage from './pages/VendorMyRFQsPage'
import VendorQuotationSubmitPage from './pages/VendorQuotationSubmitPage'
import MyQuotationsPage from './pages/MyQuotationsPage'
import POListPage from './pages/POListPage'
import InvoicesPage from './pages/InvoicesPage'
import ActivityLogPage from './pages/ActivityLogPage'
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
            <Route path="/rfqs/:id/compare" element={<QuotationComparePage />} />
            <Route path="/rfqs/:id" element={<RFQDetailPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/my-rfqs" element={<VendorMyRFQsPage />} />
            <Route path="/my-rfqs/:id/quote" element={<VendorQuotationSubmitPage />} />
            <Route path="/my-quotations" element={<MyQuotationsPage />} />
            <Route path="/pos" element={<POListPage />} />
            <Route path="/my-pos" element={<POListPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/my-invoices" element={<InvoicesPage />} />
            <Route path="/activity" element={<ActivityLogPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
