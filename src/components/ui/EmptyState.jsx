import { Inbox } from 'lucide-react'

/**
 * EmptyState — friendly "nothing here" block with optional action node.
 */
export default function EmptyState({ icon: Icon = Inbox, title, description, action = null }) {
  return (
    <div className="state">
      <span className="state__icon">
        <Icon size={22} aria-hidden="true" />
      </span>
      <p className="state__title">{title}</p>
      {description && <p className="state__desc">{description}</p>}
      {action}
    </div>
  )
}
