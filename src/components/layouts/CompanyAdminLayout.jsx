import DashboardLayout from './DashboardLayout'
import { Building2, ClipboardList, LayoutGrid, Settings, Users } from 'lucide-react'

const NAV = [
  { to: '/company', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/company/requests', label: 'Visitor requests', icon: ClipboardList },
  { to: '/company/approvals', label: 'Approvals', icon: ClipboardList },
  { to: '/company/employees', label: 'Employees', icon: Users },
  { to: '/company/locations', label: 'Office locations', icon: Building2 },
  { to: '/company/settings', label: 'Settings', icon: Settings },
]

/** Company admin shell — placeholder nav until Phase 3 screens land. */
export default function CompanyAdminLayout() {
  return (
    <DashboardLayout title="Company Admin" navItems={NAV} user={{ name: 'Company Admin', role: 'Administrator' }} />
  )
}
