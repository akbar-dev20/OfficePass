import { Link, Outlet } from 'react-router-dom'

/**
 * PublicLayout — sticky top bar + footer chrome for all public marketing /
 * auth-style routes.
 */
export default function PublicLayout() {
  return (
    <div className="public-page">
      <header className="public-header">
        <div className="container public-header__inner">
          <Link to="/" className="brand">
            <span className="brand__mark">OP</span>
            OfficePass
          </Link>
          <nav className="public-nav" aria-label="Main navigation">
            <Link to="/" className="nav-item nav-item--hide-sm">
              Home
            </Link>
            <Link to="/check-status" className="nav-item nav-item--hide-sm">
              Check status
            </Link>
            <Link to="/register-company" className="btn btn--outline btn--sm">
              Register company
            </Link>
            <Link to="/login" className="btn btn--primary btn--sm">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="container public-footer__inner">
          <p>© {new Date().getFullYear()} OfficePass — visitor management for modern offices</p>
          <nav aria-label="Footer" className="public-footer__links">
            <Link to="/check-status">Check visit status</Link>
            <Link to="/register-company">Register your company</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
