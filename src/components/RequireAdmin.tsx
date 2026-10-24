import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from './auth-context.ts'

/**
 * Guards every admin route (PRD §8.2 A1). A signed-in account without an
 * `admins/{uid}` document never counts as an admin.
 */
export default function RequireAdmin() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-cream-50">
        <img
          src="/logo-mark.png"
          alt="RIMBANARA"
          width={64}
          height={64}
          className="h-16 w-16 rounded-2xl object-cover shadow-panel ring-1 ring-cream-200"
        />
        <div className="h-1 w-40 overflow-hidden rounded-full bg-cream-200">
          <div className="skeleton h-full w-full rounded-full" />
        </div>
        <p className="text-sm text-stone-500">Memeriksa sesi admin...</p>
      </div>
    )
  }

  if (status !== 'admin') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
