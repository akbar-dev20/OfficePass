import DashboardLayout from './DashboardLayout'
import { Building2, ClipboardList, LayoutGrid, Settings, Users } from 'lucide-react'

const NAV = [
  { to: '/platform-admin', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/platform-admin/companies', label: 'Companies', icon: Building2 },
  { to: '/platform-admin/requests', label: 'All visit requests', icon: ClipboardList },
  { to: '/platform-admin/users', label: 'Platform users', icon: Users },
  { to: '/platform-admin/settings', label: 'Platform settings', icon: Settings },
]

/** Platform admin shell — placeholder nav until Phase 3 screens land. */
export default function PlatformAdminLayout() {
  return (
    <DashboardLayout title="Platform Admin" navItems={NAV} user={{ name: 'Platform Admin', role: 'Super admin' }} />
  )
}
