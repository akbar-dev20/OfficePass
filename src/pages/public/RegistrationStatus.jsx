import { useState } from 'react'
import { Clock, PartyPopper, Search, XCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import StatusBadge from '../../components/ui/StatusBadge'
import { useToast } from '../../components/ui/Toast'

const STATUS_EXPLAINERS = [
  {
    status: 'pending',
    icon: Clock,
    title: 'Pending review',
    text: 'Your request was received and is waiting for the host employee to approve it.',
  },
  {
    status: 'approved',
    icon: PartyPopper,
    title: 'Approved',
    text: 'You are cleared to visit — your QR pass will be available in the visitor portal.',
  },
  {
    status: 'rejected',
    icon: XCircle,
    title: 'Rejected',
    text: 'The host could not accommodate this visit. Contact them to arrange another time.',
  },
]

export default function RegistrationStatus() {
  const [email, setEmail] = useState('')
  const toast = useToast()

  const onSubmit = (e) => {
    e.preventDefault()
    // Phase 2: verify email via visitor_email_verifications + Edge Function email (Resend).
    toast.info('Demo mode', 'Status lookup is wired to Supabase in Phase 2.')
  }

  return (
    <main className="page-pad">
      <div className="container container--narrow">
        <div className="register-head">
          <h1>Check your registration status</h1>
          <p className="text-secondary">
            Submitted a company registration? Enter the official email you used and we'll show
            where it stands once lookups are live.
          </p>
        </div>
        <form className="check-status-form" onSubmit={onSubmit} noValidate>
          <FormField label="Official company email" htmlFor="status-email" required>
            <Input
              id="status-email"
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <Button type="submit" variant="primary" icon={Search}>
            Check status
          </Button>
        </form>
        <div className="status-explainers">
          {STATUS_EXPLAINERS.map((item) => (
            <div key={item.status} className="status-explainer">
              <span className="status-explainer__icon">
                <item.icon size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="status-explainer__title">
                  <StatusBadge status={item.status} label={item.title} />
                </p>
                <p className="status-explainer__text">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
