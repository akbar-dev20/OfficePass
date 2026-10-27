import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import LoadingState from '../../components/ui/LoadingState'
import { fetchVisitorRequests, purposeLabel } from '../../lib/visits'

const columns = [
  {
    key: 'visitor',
    header: 'Visitor',
    render: (row) => {
      const primary = row.visitors?.find((v) => v.is_primary) ?? row.visitors?.[0]
      return primary?.full_name ?? '—'
    },
  },
  {
    key: 'host',
    header: 'Host',
    render: (row) => row.employee?.full_name ?? '—',
  },
  { key: 'purpose', header: 'Purpose', render: (row) => purposeLabel(row.purpose) },
  { key: 'visit_date', header: 'Date', render: (row) => row.visit_date ?? '—' },
  {
    key: 'location',
    header: 'Location',
    render: (row) => row.office_location?.name ?? '—',
  },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  {
    key: 'actions',
    header: '',
    render: (row) => (
      <Link className="table-link" to={`/company/requests/${row.id}`}>
        Review
      </Link>
    ),
  },
]

export default function ApprovalQueue() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchVisitorRequests({ status: 'pending' })
      .then(setRequests)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader
        title="Pending approvals"
        description="Visitor requests waiting for a decision. Approve to issue a QR pass."
      />
      <section className="panel">
        <div className="panel__body">
          {loading ? (
            <LoadingState label="Loading pending requests…" />
          ) : error ? (
            <ErrorState title="Could not load approvals" description={error} />
          ) : requests.length === 0 ? (
            <EmptyState
              title="Nothing to approve"
              description="All visitor requests have been processed. New requests will appear here."
            />
          ) : (
            <DataTable columns={columns} data={requests} searchKeys={['visitor', 'host']} />
          )}
        </div>
      </section>
    </div>
  )
}
