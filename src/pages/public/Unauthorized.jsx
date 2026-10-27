import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'

export default function Unauthorized() {
  return (
    <div className="state state--fullpage">
      <span className="state__icon state__icon--error">
        <ShieldX size={24} aria-hidden="true" />
      </span>
      <h1 className="state__title">Access denied</h1>
      <p className="state__desc">
        You don't have permission to view this area. If you believe this is a mistake, contact
        your company administrator.
      </p>
      <Link to="/" className="btn btn--outline btn--sm">
        Back to home
      </Link>
    </div>
  )
}
