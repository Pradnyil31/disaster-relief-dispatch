import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sosApi } from '../../api/sosApi';
import { useAuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { URGENCY_LEVELS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = ['All', 'PENDING', 'ASSIGNED', 'EN_ROUTE', 'DELIVERED', 'CANCELLED'];

const URGENCY_BADGE = {
  High:   'badge-urgency-high',
  Medium: 'badge-urgency-medium',
  Low:    'badge-urgency-low',
};

const STATUS_BADGE = {
  PENDING:   'bg-secondary',
  ASSIGNED:  'badge-status-assigned',
  EN_ROUTE:  'badge-status-en_route',
  DELIVERED: 'badge-status-delivered',
  CANCELLED: 'bg-danger bg-opacity-10 text-danger',
};

export function MySOSHistoryPage() {
  const { user, logout } = useAuthContext();
  const { notify } = useNotification();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);         // 0-indexed for API
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          size: PAGE_SIZE,
          ...(statusFilter !== 'All' && { status: statusFilter }),
          ...(urgencyFilter !== 'All' && { urgencyLevel: urgencyFilter }),
        };
        const res = await sosApi.list(params);
        if (!cancelled) {
          // Supports Spring Pageable response: { content, totalPages } or plain array
          if (res.data?.content) {
            setRequests(res.data.content);
            setTotalPages(res.data.totalPages || 1);
          } else {
            setRequests(res.data || []);
            setTotalPages(1);
          }
        }
      } catch (err) {
        if (!cancelled) {
          notify({ message: err?.response?.data?.message || 'Failed to load SOS history.', severity: 'error' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchHistory();
    return () => { cancelled = true; };
  }, [page, statusFilter, urgencyFilter]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(0); // reset to first page on filter change
  };

  return (
    <div className="min-vh-100 bg-light animate-fade-in">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
        <div className="container-fluid container-lg">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/citizen">
            <i className="bi bi-shield-check"></i>
            Citizen Portal
          </Link>
          <div className="navbar-nav ms-auto align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 text-white bg-white bg-opacity-10 px-3 py-1 rounded-pill">
              <i className="bi bi-person-circle"></i>
              <span className="fw-medium">{user?.name}</span>
            </div>
            <button type="button" className="btn btn-outline-light btn-sm px-3 rounded-pill" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container py-4 py-lg-5">
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-1">
                <li className="breadcrumb-item"><Link to="/citizen" className="text-decoration-none">Dashboard</Link></li>
                <li className="breadcrumb-item active">SOS History</li>
              </ol>
            </nav>
            <h1 className="fw-bolder text-dark mb-0 fs-3">My SOS Requests</h1>
          </div>
          <Link to="/citizen/sos/new" className="btn btn-danger hover-lift d-flex align-items-center gap-2">
            <i className="bi bi-plus-circle-fill"></i>
            New SOS Request
          </Link>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-12 col-sm-5">
                <label htmlFor="filter-status" className="form-label fw-medium small text-muted text-uppercase" style={{ letterSpacing: '0.04em' }}>
                  Filter by Status
                </label>
                <select
                  id="filter-status"
                  className="form-select"
                  value={statusFilter}
                  onChange={handleFilterChange(setStatusFilter)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-5">
                <label htmlFor="filter-urgency" className="form-label fw-medium small text-muted text-uppercase" style={{ letterSpacing: '0.04em' }}>
                  Filter by Urgency
                </label>
                <select
                  id="filter-urgency"
                  className="form-select"
                  value={urgencyFilter}
                  onChange={handleFilterChange(setUrgencyFilter)}
                >
                  <option value="All">All Urgency Levels</option>
                  {URGENCY_LEVELS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={() => { setStatusFilter('All'); setUrgencyFilter('All'); setPage(0); }}
                  title="Clear all filters"
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card border-0 shadow-sm">
          {loading ? (
            <div className="card-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading…</span>
              </div>
              <p className="text-muted mt-3 mb-0">Loading your SOS history…</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="card-body text-center py-5">
              <div className="text-muted opacity-50 mb-3">
                <i className="bi bi-inbox fs-1"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">No requests found</h5>
              <p className="text-muted mb-4">
                {statusFilter !== 'All' || urgencyFilter !== 'All'
                  ? 'Try adjusting your filters to see more results.'
                  : "You haven't submitted any SOS requests yet."}
              </p>
              <Link to="/citizen/sos/new" className="btn btn-outline-primary hover-lift">
                <i className="bi bi-plus-circle me-2"></i>
                Submit Your First SOS
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="table-responsive d-none d-md-block">
                <table className="table table-hover mb-0" aria-label="SOS request history">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Date Submitted</th>
                      <th scope="col">Urgency</th>
                      <th scope="col">Required Supplies</th>
                      <th scope="col">Status</th>
                      <th scope="col">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req, idx) => (
                      <tr key={req.id || idx} className="align-middle">
                        <td className="text-muted fw-medium" style={{ fontSize: '0.85rem' }}>
                          {page * PAGE_SIZE + idx + 1}
                        </td>
                        <td className="small">{req.createdAt ? formatDate(req.createdAt) : '—'}</td>
                        <td>
                          <span className={`badge ${URGENCY_BADGE[req.urgencyLevel] || 'bg-secondary'}`}>
                            {req.urgencyLevel || '—'}
                          </span>
                        </td>
                        <td className="small">
                          {Array.isArray(req.requiredSupplies) && req.requiredSupplies.length > 0
                            ? req.requiredSupplies.slice(0, 3).join(', ') + (req.requiredSupplies.length > 3 ? ` +${req.requiredSupplies.length - 3} more` : '')
                            : '—'}
                        </td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[req.status] || 'bg-secondary'}`}>
                            {req.status || 'PENDING'}
                          </span>
                        </td>
                        <td className="small font-monospace text-muted">
                          {req.latitude && req.longitude
                            ? `${Number(req.latitude).toFixed(4)}, ${Number(req.longitude).toFixed(4)}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="d-md-none">
                {requests.map((req, idx) => (
                  <div key={req.id || idx} className="border-bottom p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="text-muted small">{req.createdAt ? formatDate(req.createdAt) : '—'}</span>
                      <span className={`badge ${STATUS_BADGE[req.status] || 'bg-secondary'}`}>
                        {req.status || 'PENDING'}
                      </span>
                    </div>
                    <div className="d-flex gap-2 mb-1">
                      <span className={`badge ${URGENCY_BADGE[req.urgencyLevel] || 'bg-secondary'}`}>
                        {req.urgencyLevel || 'Unknown'}
                      </span>
                    </div>
                    {Array.isArray(req.requiredSupplies) && req.requiredSupplies.length > 0 && (
                      <p className="text-muted small mb-1">
                        <i className="bi bi-box-seam me-1"></i>
                        {req.requiredSupplies.slice(0, 3).join(', ')}{req.requiredSupplies.length > 3 && ` +${req.requiredSupplies.length - 3} more`}
                      </p>
                    )}
                    {req.latitude && (
                      <p className="text-muted small mb-0 font-monospace">
                        <i className="bi bi-geo-alt me-1"></i>
                        {Number(req.latitude).toFixed(4)}, {Number(req.longitude).toFixed(4)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <nav aria-label="SOS history pagination" className="mt-4">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(i)} aria-label={`Page ${i + 1}`}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage((p) => p + 1)} aria-label="Next page">
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
            <p className="text-center text-muted small mt-2">
              Page {page + 1} of {totalPages}
            </p>
          </nav>
        )}

      </main>
    </div>
  );
}