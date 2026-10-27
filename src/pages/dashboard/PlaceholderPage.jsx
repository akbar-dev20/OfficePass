import { useLocation } from 'react-router-dom'
import { Hammer } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

/**
 * PlaceholderPage — catch-all shell for dashboard sections that arrive in
 * later phases. Derives a human title from the URL segment.
 */
export default function PlaceholderPage({ section = 'Dashboard' }) {
  const { pathname } = useLocation()
  const segment = pathname.split('/').filter(Boolean).pop() || ''
  const title = segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <div>
      <PageHeader
        title={title || section}
        eyebrow={section}
        description="This section is part of the Phase 1 route skeleton — the screen ships in a later phase."
      />
      <div className="card">
        <div className="card__body">
          <EmptyState
            icon={Hammer}
            title="Under construction"
            description="The layout, components and tokens for this screen are already in place. Functionality lands with its phase."
          />
        </div>
      </div>
    </div>
  )
}
