const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  checked_in: 'Checked in',
  checked_out: 'Checked out',
  expired: 'Expired',
  completed: 'Completed',
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  invited: 'Invited',
  queued: 'Queued',
  sent: 'Sent',
  failed: 'Failed',
  unread: 'Unread',
  read: 'Read',
  processing: 'Processing',
  bounced: 'Bounced',
}

/**
 * StatusBadge — consistent pill for any domain status. Colour variants are
 * mapped in CSS via `badge--<status>`; unknown statuses fall back to neutral.
 */
export default function StatusBadge({ status, label }) {
  const key = String(status || 'pending').toLowerCase().replace(/-/g, '_')
  return (
    <span className={`badge badge--${key}`}>
      <span className="badge__dot" aria-hidden="true" />
      {label || STATUS_LABELS[key] || key.replace(/_/g, ' ')}
    </span>
  )
}
