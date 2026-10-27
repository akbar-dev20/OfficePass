import { Link, useSearchParams } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import LoadingState from '../../components/ui/LoadingState'

export default function VerifyVisitorEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <div className="verify-head">
      <span className="state__icon">
        <MailCheck size={22} aria-hidden="true" />
      </span>
      <h1>Email verification</h1>
      {token ? (
        <>
          <p className="text-secondary">
            Verification token detected in this link. Verifying it is a server-side operation…
          </p>
          <LoadingState label="Verification endpoint is wired in Phase 2 — nothing is confirmed yet." />
        </>
      ) : (
        <>
          <p className="text-secondary">No verification token was found in this link.</p>
          <Link to="/check-status" className="btn btn--outline">
            Request a new verification email
          </Link>
        </>
      )}
    </div>
  )
}
