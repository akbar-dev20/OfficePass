import { ClipboardList, UserCheck, Users, UserPlus } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'

// Phase 1 preview data — replaced by live Supabase queries in Phase 3.
const PREVIEW_REQUESTS = [
  { id: 1, visitor: 'Jane Cooper', employee: 'EMP-0142', date: '2026-10-28', status: 'pending' },
  { id: 2, visitor: 'Alex Morgan', employee: 'EMP-0031', date: '2026-10-29', status: 'approved' },
  { id: 3, visitor: 'Sam Lee', employee: 'EMP-0087', date: '2026-10-27', status: 'checked_in' },
]

const columns = [
  { key: 'visitor', header: 'Primary visitor' },
  { key: 'employee', header: 'Host employee' },
  { key: 'date', header: 'Visit date' },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

export default function CompanyAdminDashboard() {
  return (
    <div>
      <PageHeader
        title="Company dashboard"
        description="Today's visitors, pending approvals and team activity at a glance."
      />
      <div className="stats-grid">
        <StatCard label="Pending approvals" value="—" icon={ClipboardList} hint="Awaiting backend data" />
        <StatCard label="Today's visitors" value="—" icon={Users} accent="peach" hint="Awaiting backend data" />
        <StatCard label="Active employees" value="—" icon={UserCheck} accent="cream" hint="Awaiting backend data" />
        <StatCard label="Checked in now" value="—" icon={UserPlus} accent="orange" hint="Awaiting backend data" />
      </div>
      <section className="panel">
        <div className="panel__head">
          <span>Recent visitor requests</span>
          <span className="preview-note">Sample data — live queries arrive in Phase 3</span>
        </div>
        <div className="panel__body">
          <DataTable
            columns={columns}
            data={PREVIEW_REQUESTS}
            searchKeys={['visitor', 'employee']}
            filters={[{ key: 'status', label: 'Status', options: ['pending', 'approved', 'checked_in'] }]}
          />
        </div>
      </section>
    </div>
  )
}
