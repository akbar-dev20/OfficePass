import { CalendarClock, ClipboardList, UserPlus } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import EmptyState from '../../components/ui/EmptyState'

export default function EmployeeDashboard() {
  return (
    <div>
      <PageHeader
        title="My dashboard"
        description="Requests you've raised and visitors coming to see you."
      />
      <div className="stats-grid">
        <StatCard label="Pending requests" value="—" icon={ClipboardList} hint="Awaiting backend data" />
        <StatCard label="Upcoming visits" value="—" icon={CalendarClock} accent="peach" hint="Awaiting backend data" />
        <StatCard label="Visitors to host" value="—" icon={UserPlus} accent="cream" hint="Awaiting backend data" />
      </div>
      <section className="panel">
        <div className="panel__head">
          <span>My visit requests</span>
          <span className="preview-note">Sample data arrives in Phase 3</span>
        </div>
        <div className="panel__body">
          <EmptyState
            title="No requests yet"
            description="When you raise a visitor request it will appear here with its approval status."
          />
        </div>
      </section>
    </div>
  )
}
