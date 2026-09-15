import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { sosApi } from '../../api/sosApi';
import { formatDate, getUrgencyBadgeClass } from '../../utils/helpers';
import toast from 'react-hot-toast';

export function SOSManagementPage() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSOSRequests = async () => {
    try {
      setLoading(true);
      const res = await sosApi.list({
        urgency: urgencyFilter,
        status: statusFilter,
        search: searchTerm,
      });
      setRequests(res.content || res || []);
    } catch {
      toast.error('Failed to load SOS requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSOSRequests();
  }, [urgencyFilter, statusFilter, searchTerm]);

  const handleAssignDispatch = (sos) => {
    // Navigate to dispatch management pre-filling the selected SOS request
    navigate('/admin/dispatch', { state: { selectedSosId: sos.id } });
  };

  return (
    <div className="min-vh-100 bg-light animate-fade-in">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm glass">
        <div className="container max-w-6xl">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/admin">
            <i className="bi bi-shield-lock-fill text-warning"></i>
            Admin Command Center
          </Link>
          <div className="navbar-nav ms-auto align-items-center gap-2">
            <Link to="/admin" className="btn btn-outline-light btn-sm rounded-pill px-3 me-2">
              <i className="bi bi-speedometer2 me-1"></i> Dashboard
            </Link>
            <div className="d-flex align-items-center gap-2 text-white bg-white bg-opacity-10 px-3 py-1 rounded-pill">
              <i className="bi bi-person-badge"></i>
              <span className="fw-medium">{user?.name || 'Admin'}</span>
            </div>
            <button
              type="button"
              className="btn btn-outline-light btn-sm px-3 rounded-pill hover-lift me-1"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container max-w-6xl py-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bolder text-dark mb-1">SOS Emergency Requests (FR-2.4)</h2>
            <p className="text-muted mb-0">Filter, search, and assign pending emergency distress calls to volunteers.</p>
          </div>
          <Link to="/admin/dispatch" className="btn btn-warning rounded-pill px-4 shadow-sm text-dark fw-bold">
            <i className="bi bi-truck me-2"></i>Dispatch Console
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div className="card border-0 shadow-sm rounded-3 mb-4 p-3 bg-white">
          <div className="row g-3 align-items-center">
            {/* Urgency Filter */}
            <div className="col-12 col-md-4">
              <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">Filter by Urgency</label>
              <select
                className="form-select form-select-sm"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
              >
                <option value="ALL">All Urgency Levels</option>
                <option value="High">High Urgency</option>
                <option value="Medium">Medium Urgency</option>
                <option value="Low">Low Urgency</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-12 col-md-4">
              <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">Filter by Status</label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Dispatch</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="col-12 col-md-4">
              <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">Search Requests</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="Citizen name, phone, or supply..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SOS Table */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">Distress Alerts ({requests.length})</h5>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2 mb-0">Loading distress signals...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-check-circle fs-1 text-success d-block mb-2"></i>
                <h5 className="fw-bold text-dark mb-1">No SOS Requests Found</h5>
                <p className="text-muted mb-0">No distress signals match your selected filter criteria.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light fs-7 text-uppercase text-muted">
                    <tr>
                      <th className="ps-4">SOS Ref ID</th>
                      <th>Citizen Details</th>
                      <th>Urgency</th>
                      <th>Supplies Needed</th>
                      <th>Coordinates</th>
                      <th>Submitted Date</th>
                      <th className="pe-4 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td className="ps-4 fw-bold text-primary">{r.id}</td>
                        <td>
                          <div className="fw-semibold text-dark">{r.citizenName || 'Citizen'}</div>
                          <div className="fs-7 text-muted"><i className="bi bi-telephone me-1"></i>{r.citizenPhone || 'N/A'}</div>
                        </td>
                        <td>
                          <span className={`badge ${getUrgencyBadgeClass(r.urgencyLevel)} px-2 py-1`}>
                            {r.urgencyLevel}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1 max-w-xs">
                            {r.requiredSupplies?.map((s, idx) => (
                              <span key={idx} className="badge bg-light text-dark border fs-7 fw-normal">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="fs-7 text-muted font-monospace">
                          {r.latitude ? `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}` : 'N/A'}
                        </td>
                        <td className="fs-7 text-muted">{formatDate(r.createdAt)}</td>
                        <td className="pe-4 text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning rounded-pill px-3 text-dark fw-bold me-1"
                            onClick={() => handleAssignDispatch(r)}
                          >
                            <i className="bi bi-truck me-1"></i> Assign
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}