import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutGrid, Search } from 'lucide-react'
import DashboardLayout from './DashboardLayout'

const PORTAL_NAV = [
  { to: '/visitor-portal', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/check-status', label: 'Check a request', icon: Search, end: true },
]

/**
 * VisitorLayout — mobile-first chrome for visitor flows.
 * - Focused flows (/visit/*, /check-status, /verify-visitor-email): cream
 *   background, centred white card, slim top bar.
 * - Portal (/visitor-portal/*): reuses the dashboard shell with a visitor nav
 *   (sidebar on desktop, collapsible drawer on mobile).
 */
export default function VisitorLayout() {
  const { pathname } = useLocation()
  const isPortal = pathname.startsWith('/visitor-portal')

  if (isPortal) {
    return (
      <DashboardLayout
        title="Visitor Portal"
        navItems={PORTAL_NAV}
        variant="visitor"
        user={{ name: 'Visitor', role: 'Guest session' }}
      />
    )
  }

  return (
    <div className="visitor-page">
      <header className="visitor-topbar">
        <Link to="/" className="brand">
          <span className="brand__mark">OP</span>
          OfficePass
        </Link>
        <Link to="/check-status" className="link-quiet">
          Check status
        </Link>
      </header>
      <main className="visitor-main">
        <div className="visitor-card">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
