import DashboardLayout from './DashboardLayout'
import { ClipboardList, LayoutGrid, Settings, UserPlus, Users } from 'lucide-react'

const NAV = [
  { to: '/employee', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/employee/visits', label: 'My visits', icon: ClipboardList },
  { to: '/employee/new-request', label: 'New visitor request', icon: UserPlus },
  { to: '/employee/visitors', label: 'My visitors', icon: Users },
  { to: '/employee/settings', label: 'Settings', icon: Settings },
]

/** Employee shell — placeholder nav until Phase 3 screens land. */
export default function EmployeeLayout() {
  return (
    <DashboardLayout title="Employee" navItems={NAV} user={{ name: 'Employee', role: 'Staff' }} />
  )
}
