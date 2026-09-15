import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { volunteerApi } from '../../api/volunteerApi';
import toast from 'react-hot-toast';

function StatusDropdownMenu({ volunteer, updatingId, onStatusChange, isDropup }) {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: 'AVAILABLE', label: 'Available', color: 'text-success', icon: 'bi-circle-fill' },
    { value: 'BUSY', label: 'Busy', color: 'text-warning', icon: 'bi-dash-circle-fill' },
    { value: 'OFFLINE', label: 'Offline', color: 'text-secondary', icon: 'bi-x-circle-fill' },
  ];

  const currentOpt = options.find((o) => o.value === volunteer.status) || options[0];

  return (
    <div className="position-relative d-inline-block">
      <button
        type="button"
        className={`btn btn-sm rounded-pill px-3 py-1 fw-bold shadow-sm d-inline-flex align-items-center gap-2 border transition-all ${
          volunteer.status === 'AVAILABLE'
            ? 'btn-outline-success bg-success bg-opacity-10 text-success'
            : volunteer.status === 'BUSY'
            ? 'btn-outline-warning bg-warning bg-opacity-10 text-dark'
            : 'btn-outline-secondary bg-secondary bg-opacity-10 text-secondary'
        }`}
        disabled={updatingId === volunteer.id}
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className={`bi ${currentOpt.icon} ${currentOpt.color} fs-7`}></i>
        <span>{updatingId === volunteer.id ? 'Updating...' : currentOpt.label}</span>
        <i className={`bi bi-chevron-down fs-7 ms-1 transition-all ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to dismiss menu */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1040 }}
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Custom Options Floating Card */}
          <div
            className="position-absolute end-0 bg-white rounded-3 shadow-lg border p-1 animate-fade-in"
            style={{
              zIndex: 1050,
              minWidth: '170px',
              ...(isDropup ? { bottom: '100%', marginBottom: '0.4rem' } : { top: '100%', marginTop: '0.4rem' }),
            }}
          >
            <div className="px-3 py-1.5 fs-7 text-uppercase text-muted fw-bold border-bottom mb-1" style={{ letterSpacing: '0.05em' }}>
              Change Status
            </div>
            {options.map((opt) => {
              const isSelected = volunteer.status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`w-100 text-start btn btn-sm border-0 rounded-2 px-3 py-2 d-flex align-items-center justify-content-between fw-semibold fs-7 mb-1 transition-all ${
                    isSelected ? 'bg-primary bg-opacity-10 text-primary' : 'text-dark hover-bg-light'
                  }`}
                  onClick={() => {
                    setIsOpen(false);
                    if (!isSelected) {
                      onStatusChange(volunteer.id, opt.value);
                    }
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${opt.icon} ${opt.color}`}></i>
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <i className="bi bi-check2 text-primary fw-bold fs-6"></i>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function VolunteerManagementPage() {
  const { user, logout } = useAuthContext();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const res = await volunteerApi.list({
        status: statusFilter,
        search: searchTerm,
      });
      setVolunteers(res.content || res || []);
    } catch {
      toast.error('Failed to load volunteer roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [statusFilter, searchTerm]);

  const handleStatusChange = async (volId, nextStatus) => {
    try {
      setUpdatingId(volId);
      await volunteerApi.updateStatus(volId, nextStatus);
      toast.success(`Volunteer status set to ${nextStatus}`);
      await fetchVolunteers();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-success';
      case 'BUSY': return 'bg-warning text-dark';
      case 'OFFLINE': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
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
            <h2 className="fw-bolder text-dark mb-1">Volunteer Personnel Roster</h2>
            <p className="text-muted mb-0">Manage registered field volunteers, assign operational zones, and update availability.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm rounded-3 mb-4 p-3 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">Availability Filter</label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy / On Mission</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">Search Volunteers</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="Search name, phone, or zone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Volunteer Table */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">Registered Volunteers ({volunteers.length})</h5>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2 mb-0">Loading volunteer personnel...</p>
              </div>
            ) : volunteers.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-people fs-1 text-muted d-block mb-2 opacity-50"></i>
                <h5 className="fw-bold text-dark mb-1">No Volunteers Found</h5>
                <p className="text-muted mb-0">No registered volunteers match your criteria.</p>
              </div>
            ) : (
              <div className="table-responsive" style={{ minHeight: '260px' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light fs-7 text-uppercase text-muted">
                    <tr>
                      <th className="ps-4">Volunteer Ref</th>
                      <th>Full Name</th>
                      <th>Contact Details</th>
                      <th>Assigned Zone</th>
                      <th>Status</th>
                      <th className="pe-4 text-end">Update Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((v, idx) => (
                      <tr key={v.id}>
                        <td className="ps-4 fw-bold text-primary fs-7">{v.id}</td>
                        <td>
                          <div className="fw-bold text-dark">{v.name}</div>
                        </td>
                        <td>
                          <div className="fs-7 text-dark">{v.email}</div>
                          <div className="fs-7 text-muted">{v.phone}</div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border fw-normal">
                            <i className="bi bi-geo-alt me-1 text-danger"></i>{v.zone}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(v.status)} px-2 py-1`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          <StatusDropdownMenu
                            volunteer={v}
                            updatingId={updatingId}
                            onStatusChange={handleStatusChange}
                            isDropup={idx >= volunteers.length - 2}
                          />
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