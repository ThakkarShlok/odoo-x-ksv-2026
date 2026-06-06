import Navbar from '../components/Navbar'
import Card from '../components/Card'
import useAuth from '../hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar brand="App" />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome, {user?.name || 'User'}
        </h1>
        <p className="text-gray-500 mb-8">Your dashboard is ready. Add your features here.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-xl font-semibold text-gray-800 mt-1">{user?.role}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-xl font-semibold text-gray-800 mt-1">{user?.email}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-xl font-semibold text-green-600 mt-1">Active</p>
          </Card>
        </div>
      </main>
    </div>
  )
}
