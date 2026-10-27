import { Link, useParams } from 'react-router-dom'
import { QrCode } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'

export default function VisitorPass() {
  const { requestId } = useParams()

  return (
    <div className="pass-card">
      <div className="pass-card__head">
        <h1>Visitor pass</h1>
        <StatusBadge status="pending" />
      </div>
      <p className="text-secondary">Show this pass at reception on arrival.</p>
      <div className="pass-qr">
        <QrCode size={72} aria-hidden="true" />
      </div>
      <dl className="detail-list">
        <div className="detail-row">
          <dt>Reference</dt>
          <dd>{requestId}</dd>
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
          <dt>Valid for</dt>
          <dd>—</dd>
        </div>
      </dl>
      <p className="preview-note">
        QR generation &amp; signed pass links ship in Phase 3 (Edge Functions).
      </p>
    </div>
  )
}
