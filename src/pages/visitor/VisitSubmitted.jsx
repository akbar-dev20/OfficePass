import { Link } from 'react-router-dom'
import { PartyPopper } from 'lucide-react'

export default function VisitSubmitted() {
  return (
    <div className="success-panel">
      <span className="success-panel__icon">
        <PartyPopper size={28} aria-hidden="true" />
      </span>
      <h1>Request submitted</h1>
      <p className="success-panel__text">
        Your visit request is on its way to the host employee for approval. We'll email you as
        soon as it's reviewed.
      </p>
      <div className="success-panel__actions">
        <Link to="/check-status" className="btn btn--outline">
          Check request status
        </Link>
        <Link to="/" className="btn btn--secondary">
          Back to home
        </Link>
      </div>
      <p className="preview-note">
        Phase 1 preview — actual submission to Supabase + confirmation email land in Phase 2.
      </p>
    </div>
  )
}
