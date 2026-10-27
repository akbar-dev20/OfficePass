import { AlertTriangle } from 'lucide-react'
import Button from './Button'

/**
 * ErrorState — failure block with optional retry callback.
 */
export default function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry = null,
}) {
  return (
    <div className="state state--error" role="alert">
      <span className="state__icon">
        <AlertTriangle size={22} aria-hidden="true" />
      </span>
      <p className="state__title">{title}</p>
      {description && <p className="state__desc">{description}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
