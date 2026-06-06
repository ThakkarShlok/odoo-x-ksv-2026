import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Button from './Button'

export default function Navbar({ brand = 'App' }) {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <nav className="border-b border-slate-200 bg-white px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-lg font-bold text-teal-700">
        {brand}
      </Link>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-slate-600">{user?.name || user?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-slate-600 hover:text-teal-700">
              Login
            </Link>
            <Link to="/register">
              <Button size="sm">Register</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
