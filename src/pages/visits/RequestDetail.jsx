import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, QrCode } from 'lucide-react'
import QRCode from 'qrcode'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../components/auth/AuthProvider'
import { ROLES } from '../../lib/auth'
import {
  fetchVisitorRequest,
  approveVisitorRequest,
  rejectVisitorRequest,
  cancelVisitorRequest,
  checkInVisitor,
  checkOutVisitor,
  purposeLabel,
  durationLabel,
} from '../../lib/visits'

export default function RequestDetail() {
  const { requestId } = useParams()
  const { role } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirm, setConfirm] = useState(null) // { title, description, action }
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await fetchVisitorRequest(requestId)
      if (!data) {
        setError('Request not found, or you do not have access to it.')
      }
      setRequest(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [requestId])

  useEffect(() => {
    load()
  }, [load])

  // Render the QR code whenever an approved request has a pass token.
  useEffect(() => {
    if (request?.pass_token) {
      const payload = JSON.stringify({
        t: request.pass_token,
        c: request.pass_code,
        r: request.id,
      })
      QRCode.toDataURL(payload, { width: 240, margin: 1, errorCorrectionLevel: 'M' })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(null))
    } else {
      setQrDataUrl(null)
    }
  }, [request])

  const run = async (fn, successMessage) => {
    setBusy(true)
    try {
      await fn()
      toast.success('Done', successMessage)
      await load()
    } catch (err) {
      toast.error('Action failed', err.message)
    } finally {
      setBusy(false)
      setConfirm(null)
    }
  }

  const isAdmin = role === ROLES.COMPANY_ADMIN || role === ROLES.PLATFORM_ADMIN
  const primary = request?.visitors?.find((v) => v.is_primary) ?? request?.visitors?.[0]
  const latestApproval = request?.approvals?.slice(-1)[0]

  if (loading) return <LoadingState label="Loading request…" />
  if (error || !request) {
    return (
      <div>
        <PageHeader title="Visitor request" />
        <ErrorState title="Request unavailable" description={error ?? 'Not found'} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`Visit — ${primary?.full_name ?? 'Visitor'}`}
        description={`Requested ${new Date(request.created_at).toLocaleDateString()}`}
        action={
          <Link className="btn btn--ghost" to={-1 ? undefined : '/employee/visits'} onClick={(e) => { e.preventDefault(); navigate(-1) }}>
            <ArrowLeft size={16} /> Back
          </Link>
        }
      />

      <div className="detail-grid">
        <section className="panel">
          <div className="panel__head"><span>Visit details</span><StatusBadge status={request.status} /></div>
          <div className="panel__body">
            <dl className="detail-list">
              <div className="detail-row"><dt>Purpose</dt><dd>{purposeLabel(request.purpose)}</dd></div>
              <div className="detail-row"><dt>Date</dt><dd>{request.visit_date}</dd></div>
              <div className="detail-row"><dt>Expected arrival</dt><dd>{request.start_time}</dd></div>
              <div className="detail-row"><dt>Duration</dt><dd>{durationLabel(request.duration)}</dd></div>
              <div className="detail-row"><dt>Location</dt><dd>{request.office_location?.name ?? '—'}</dd></div>
              <div className="detail-row"><dt>Host</dt><dd>{request.employee?.full_name ?? '—'}</dd></div>
              {request.purpose_notes && (
                <div className="detail-row"><dt>Notes</dt><dd>{request.purpose_notes}</dd></div>
              )}
              {request.checked_in_at && (
                <div className="detail-row"><dt>Checked in</dt><dd>{new Date(request.checked_in_at).toLocaleString()}</dd></div>
              )}
              {request.checked_out_at && (
                <div className="detail-row"><dt>Checked out</dt><dd>{new Date(request.checked_out_at).toLocaleString()}</dd></div>
              )}
            </dl>
          </div>
        </section>

        <section className="panel">
          <div className="panel__head"><span>Visitor</span></div>
          <div className="panel__body">
            <dl className="detail-list">
              <div className="detail-row"><dt>Name</dt><dd>{primary?.full_name}</dd></div>
              <div className="detail-row"><dt>Email</dt><dd>{primary?.email}</dd></div>
              <div className="detail-row"><dt>Phone</dt><dd>{primary?.phone}</dd></div>
              <div className="detail-row"><dt>Organisation</dt><dd>{primary?.organisation || '—'}</dd></div>
            </dl>
            {latestApproval && (
              <p className="text-secondary" style={{ marginTop: '1rem' }}>
                {latestApproval.decision === 'approved' ? 'Approved' : 'Rejected'}
                {latestApproval.reason ? ` — ${latestApproval.reason}` : ''}
                {' · '}
                {new Date(latestApproval.decided_at).toLocaleString()}
              </p>
            )}
          </div>
        </section>

        {request.status === 'approved' && (
          <section className="panel panel--pass">
            <div className="panel__head"><span>Visitor pass</span><span className="pass-code">{request.pass_code}</span></div>
            <div className="panel__body pass-body">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR pass ${request.pass_code}`} className="pass-qr-img" />
              ) : (
                <div className="pass-qr"><QrCode size={72} aria-hidden="true" /></div>
              )}
              <p className="text-secondary">Show this QR at reception on arrival.</p>
              <a className="btn btn--ghost" href={qrDataUrl ?? '#'} download={`pass-${request.pass_code}.png`}>
                Download pass
              </a>
            </div>
          </section>
        )}
      </div>

      <div className="form-actions">
        {isAdmin && request.status === 'pending' && (
          <>
            <Button
              variant="primary"
              loading={busy}
              onClick={() => setConfirm({ title: 'Approve this visit?', description: 'A QR pass will be issued to the host.', action: () => approveVisitorRequest(request.id) })}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={() => setConfirm({ title: 'Reject this visit?', description: 'The host will be notified of the decision.', action: () => rejectVisitorRequest(request.id) })}
            >
              Reject
            </Button>
          </>
        )}
        {request.status === 'pending' && !isAdmin && (
          <Button
            variant="danger"
            loading={busy}
            onClick={() => setConfirm({ title: 'Cancel this request?', description: 'This cannot be undone.', action: () => cancelVisitorRequest(request.id) })}
          >
            Cancel request
          </Button>
        )}
        {request.status === 'approved' && (
          <Button variant="primary" loading={busy} onClick={() => run(() => checkInVisitor(request.id), 'Visitor checked in')}>
            Check in
          </Button>
        )}
        {request.status === 'checked_in' && (
          <Button variant="primary" loading={busy} onClick={() => run(() => checkOutVisitor(request.id), 'Visitor checked out')}>
            Check out
          </Button>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          description={confirm.description}
          confirmLabel="Confirm"
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={() => run(confirm.action, 'Updated')}
        />
      )}
    </div>
  )
}
