import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

export default function VisitorPortal() {
  return (
    <div>
      <PageHeader
        title="My visit requests"
        description="Track approvals, passes and visit history from one place."
      />
      <div className="card">
        <div className="card__body">
          <EmptyState
            icon={ClipboardList}
            title="No visit requests yet"
            description="Once you submit a visit request — or one is made for you — it will appear here with its live status and pass."
            action={
              <Link to="/" className="btn btn--outline btn--sm">
                Back to home
              </Link>
            }
          />
        </div>
      </div>
      <p className="preview-note">
        Phase 1 placeholder — portal sign-in and request data arrive with Phase 2 (Supabase DB +
        RLS).
      </p>
    </div>
  )
}
