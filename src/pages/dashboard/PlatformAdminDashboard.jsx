import { Building2, ClipboardList, Users } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'

// Phase 1 preview data — replaced by live Supabase queries in Phase 3.
const PREVIEW_COMPANIES = [
  { id: 1, name: 'Northwind Traders', plan: 'Trial', status: 'pending', users: 3 },
  { id: 2, name: 'Globex Corporation', plan: 'Pro', status: 'approved', users: 24 },
  { id: 3, name: 'Initech', plan: 'Pro', status: 'approved', users: 11 },
  { id: 4, name: 'Umbrella Logistics', plan: 'Trial', status: 'suspended', users: 7 },
]

const columns = [
  { key: 'name', header: 'Company' },
  { key: 'users', header: 'Users' },
  { key: 'plan', header: 'Plan' },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

export default function PlatformAdminDashboard() {
  return (
    <div>
      <PageHeader
        title="Platform dashboard"
        description="Monitor companies, usage and platform health."
      />
      <div className="stats-grid">
        <StatCard label="Companies" value="—" icon={Building2} hint="Awaiting backend data" />
        <StatCard label="Active users" value="—" icon={Users} accent="peach" hint="Awaiting backend data" />
        <StatCard label="Visit requests" value="—" icon={ClipboardList} accent="cream" hint="Awaiting backend data" />
        <StatCard label="Pending approvals" value="—" icon={ClipboardList} accent="orange" hint="Awaiting backend data" />
      </div>
      <section className="panel">
        <div className="panel__head">
          <span>Companies</span>
          <span className="preview-note">Sample data — live queries arrive in Phase 3</span>
        </div>
        <div className="panel__body">
          <DataTable
            columns={columns}
            data={PREVIEW_COMPANIES}
            searchKeys={['name']}
            filters={[{ key: 'status', label: 'Status', options: ['pending', 'approved', 'suspended'] }]}
          />
        </div>
      </section>
    </div>
  )
}
