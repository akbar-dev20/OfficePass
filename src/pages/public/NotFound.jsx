import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="state state--fullpage">
      <span className="state__icon">
        <SearchX size={24} aria-hidden="true" />
      </span>
      <h1 className="state__title">Page not found</h1>
      <p className="state__desc">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn btn--outline btn--sm">
        Back to home
      </Link>
    </div>
  )
}
