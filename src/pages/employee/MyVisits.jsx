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
  { key: 'purpose', header: 'Purpose', render: (row) => purposeLabel(row.purpose) },
  { key: 'visit_date', header: 'Date', render: (row) => row.visit_date ?? '—' },
  { key: 'start_time', header: 'Arrival', render: (row) => row.start_time ?? '—' },
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
      <Link className="table-link" to={`/employee/visits/${row.id}`}>
        View
      </Link>
    ),
  },
]

export default function MyVisits() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchVisitorRequests({ mine: true })
      .then(setRequests)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader
        title="My visits"
        description="Every visitor request you've raised, with its approval status."
        action={
          <Link className="btn btn--primary" to="/employee/new-request">
            New request
          </Link>
        }
      />
      <section className="panel">
        <div className="panel__body">
          {loading ? (
            <LoadingState label="Loading your requests…" />
          ) : error ? (
            <ErrorState title="Could not load requests" description={error} />
          ) : requests.length === 0 ? (
            <EmptyState
              title="No requests yet"
              description="Raise your first visitor request and it will appear here with its approval status."
              action={
                <Link className="btn btn--primary" to="/employee/new-request">
                  New request
                </Link>
              }
            />
          ) : (
            <DataTable columns={columns} data={requests} searchKeys={['visitor', 'purpose']} />
          )}
        </div>
      </section>
    </div>
  )
}
