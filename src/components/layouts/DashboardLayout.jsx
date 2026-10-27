import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { useToast } from '../ui/Toast'

/**
 * DashboardLayout — shared app shell: fixed sidebar (collapses to a slide-in
 * drawer under 960px), sticky header with hamburger + user chip, content area.
 * The three role layouts (platform admin / company / employee) and the visitor
 * portal reuse this shell with different nav configs.
 */
export default function DashboardLayout({ title, navItems = [], user, variant = 'default', children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const toast = useToast()

  // Close the mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const signOut = () => {
    // Phase 2: supabase.auth.signOut() + redirect to /login
    toast.info('Demo mode', 'Sign-out will be wired to Supabase Auth in Phase 2.')
  }

  const nav = (
    <nav className="sidebar__nav" aria-label="Primary">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          {item.icon && <item.icon size={18} aria-hidden="true" />}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )

  const initials = (user?.name || '?')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className={`dash-shell${variant === 'visitor' ? ' dash-shell--visitor' : ''}${
        mobileOpen ? ' sidebar-open' : ''
      }`}
    >
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className="sidebar">
        <Link to="/" className="sidebar__brand">
          <span className="brand__mark">OP</span>
          OfficePass
        </Link>
        {nav}
        <div className="sidebar__footer">
          <button type="button" className="nav-link" onClick={signOut}>
            <LogOut size={18} aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      <div className="dash-main">
        <header className="dash-header">
          <button
            type="button"
            className="icon-btn hamburger-btn"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <p className="dash-header__title">{title}</p>
          <div className="dash-header__spacer" />
          {user && (
            <div className="user-chip">
              <span className="user-chip__avatar" aria-hidden="true">
                {initials}
              </span>
              <div className="user-chip__meta">
                <p className="user-chip__name">{user.name}</p>
                <p className="user-chip__role">{user.role}</p>
              </div>
            </div>
          )}
        </header>
        <main className="dash-content">{children ?? <Outlet />}</main>
      </div>
    </div>
  )
}
