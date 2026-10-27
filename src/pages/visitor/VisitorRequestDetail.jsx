import { Link, useParams } from 'react-router-dom'
import { QrCode } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'

export default function VisitorRequestDetail() {
  const { requestId } = useParams()

  return (
    <div>
      <PageHeader
        title="Request details"
        description={`Reference: ${requestId}`}
        actions={
          <Link to={`/visitor-portal/pass/${requestId}`} className="btn btn--primary btn--sm">
            <QrCode size={16} aria-hidden="true" />
            View pass
          </Link>
        }
      />
      <div className="card">
        <div className="card__body">
          <dl className="detail-list">
            <div className="detail-row">
              <dt>Status</dt>
              <dd>
                <StatusBadge status="pending" />
              </dd>
            </div>
            <div className="detail-row">
              <dt>Office</dt>
              <dd>—</dd>
            </div>
            <div className="detail-row">
              <dt>Date &amp; time</dt>
              <dd>—</dd>
            </div>
            <div className="detail-row">
              <dt>Host employee</dt>
              <dd>—</dd>
            </div>
            <div className="detail-row">
              <dt>Visitors</dt>
              <dd>—</dd>
            </div>
          </dl>
          <p className="preview-note">
            Preview layout with placeholder values — live data is fetched from Supabase in
            Phase 2/3.
          </p>
        </div>
      </div>
    </div>
  )
}
