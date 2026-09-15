import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { dispatchApi } from '../../api/dispatchApi';
import { formatDate, getUrgencyBadgeClass, getDispatchStatusBadgeClass } from '../../utils/helpers';
import toast from 'react-hot-toast';

export function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const data = await dispatchApi.get(id);
      setTask(data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const updated = await dispatchApi.updateStatus(id, newStatus, statusNote);
      setTask(updated);
      setStatusNote('');
      toast.success(`Task status updated to ${newStatus.replace('_', ' ')}!`);
    } catch {
      toast.error('Failed to update task status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading task...</span>
          </div>
          <p className="text-muted mt-2">Loading mission details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-vh-100 bg-light py-5">
        <div className="container max-w-2xl text-center">
          <div className="alert alert-warning p-4 rounded-3 shadow-sm">
            <i className="bi bi-exclamation-triangle fs-1 text-warning d-block mb-2"></i>
            <h4 className="fw-bold text-dark mb-2">Task Not Found</h4>
            <p className="text-muted mb-4">The requested dispatch task #{id} could not be found or has been removed.</p>
            <Link to="/volunteer/tasks" className="btn btn-primary rounded-pill px-4">
              Return to My Tasks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${task.latitude},${task.longitude}`;

  return (
    <div className="min-vh-100 bg-light animate-fade-in">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm glass">
        <div className="container max-w-6xl">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/volunteer">
            <i className="bi bi-people-fill text-warning"></i>
            <span>Volunteer Portal</span>
          </Link>
          <div className="navbar-nav ms-auto align-items-center gap-2">
            <Link to="/volunteer/tasks" className="btn btn-outline-light btn-sm rounded-pill px-3 me-2">
              <i className="bi bi-arrow-left me-1"></i> Back to Tasks
            </Link>
            <div className="d-flex align-items-center gap-2 text-white bg-white bg-opacity-10 px-3 py-1 rounded-pill">
              <i className="bi bi-person-circle"></i>
              <span className="fw-medium">{user?.name || 'Volunteer'}</span>
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

      <main className="container max-w-4xl py-4">
        {/* Header Breadcrumb & Status Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-secondary px-2 py-1 fs-7">{task.id}</span>
              <span className="text-muted fs-7">SOS Request: {task.sosId}</span>
            </div>
            <h2 className="fw-bolder text-dark mb-0">Dispatch Mission Details</h2>
          </div>
          <div className="d-flex gap-2">
            <span className={`badge ${getUrgencyBadgeClass(task.urgencyLevel)} px-3 py-2 fs-6`}>
              {task.urgencyLevel} Urgency
            </span>
            <span className={`badge ${getDispatchStatusBadgeClass(task.status)} px-3 py-2 fs-6`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Status Workflow Action Stepper (FR-4.3) */}
        <div className="card border-0 shadow-sm rounded-3 mb-4 p-4 bg-white">
          <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-arrow-right-circle-fill text-primary"></i> Mission Progress Tracker
          </h5>

          {/* Workflow Stepper Bar */}
          <div className="row g-2 text-center mb-4">
            <div className="col-4">
              <div className={`p-2 rounded-3 border ${task.status === 'ASSIGNED' ? 'bg-primary text-white fw-bold shadow-sm' : 'bg-light text-muted'}`}>
                <i className="bi bi-person-check d-block fs-4 mb-1"></i>
                <span className="fs-7 text-uppercase">1. Assigned</span>
              </div>
            </div>
            <div className="col-4">
              <div className={`p-2 rounded-3 border ${task.status === 'EN_ROUTE' ? 'bg-warning text-dark fw-bold shadow-sm' : 'bg-light text-muted'}`}>
                <i className="bi bi-truck d-block fs-4 mb-1"></i>
                <span className="fs-7 text-uppercase">2. En Route</span>
              </div>
            </div>
            <div className="col-4">
              <div className={`p-2 rounded-3 border ${task.status === 'DELIVERED' ? 'bg-success text-white fw-bold shadow-sm' : 'bg-light text-muted'}`}>
                <i className="bi bi-check-circle d-block fs-4 mb-1"></i>
                <span className="fs-7 text-uppercase">3. Delivered</span>
              </div>
            </div>
          </div>

          {/* Action Button Controls */}
          <div className="bg-light p-3 rounded-3 border">
            <label className="form-label fw-semibold text-dark fs-7 mb-2">Optional Update Note / Remark:</label>
            <input
              type="text"
              className="form-control form-control-sm mb-3"
              placeholder="e.g. Left warehouse with 20L water, ETA 15 mins..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />

            <div className="d-flex flex-wrap gap-2 justify-content-end">
              {task.status === 'ASSIGNED' && (
                <button
                  type="button"
                  className="btn btn-warning rounded-pill px-4 text-dark fw-bold hover-lift"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange('EN_ROUTE')}
                >
                  {updatingStatus ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span> Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-geo-alt me-2"></i> Start En Route to Location
                    </>
                  )}
                </button>
              )}

              {task.status === 'EN_ROUTE' && (
                <button
                  type="button"
                  className="btn btn-success rounded-pill px-4 fw-bold hover-lift"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange('DELIVERED')}
                >
                  {updatingStatus ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span> Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i> Confirm Delivery Completed
                    </>
                  )}
                </button>
              )}

              {task.status === 'DELIVERED' && (
                <div className="alert alert-success mb-0 py-2 px-3 fs-7 w-100 text-center fw-medium">
                  <i className="bi bi-check-circle-fill me-1"></i> Mission Completed! Relief supplies handed over successfully.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          {/* Left Column: Citizen & Location Information */}
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm rounded-3 h-100 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">
                <i className="bi bi-person-badge text-danger me-2"></i>Citizen Information
              </h5>

              <div className="mb-3">
                <span className="text-muted fs-7 text-uppercase fw-semibold d-block">Citizen Name</span>
                <span className="fs-5 fw-bold text-dark">{task.citizenName}</span>
              </div>

              <div className="mb-3">
                <span className="text-muted fs-7 text-uppercase fw-semibold d-block">Contact Phone</span>
                <a href={`tel:${task.citizenPhone}`} className="btn btn-sm btn-outline-success rounded-pill px-3 mt-1 fw-bold">
                  <i className="bi bi-telephone-fill me-1"></i> {task.citizenPhone || 'N/A'}
                </a>
              </div>

              <div className="mb-3">
                <span className="text-muted fs-7 text-uppercase fw-semibold d-block">Dispatch Location</span>
                <p className="text-dark mb-1 fw-medium">{task.locationName || 'GPS Location'}</p>
                <div className="fs-7 text-muted font-monospace">
                  Lat: {task.latitude}, Lng: {task.longitude}
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-danger rounded-pill px-3 mt-2 fw-semibold"
                >
                  <i className="bi bi-map-fill me-1"></i> Open in Google Maps
                </a>
              </div>

              {task.notes && (
                <div>
                  <span className="text-muted fs-7 text-uppercase fw-semibold d-block">Citizen Notes / Remarks</span>
                  <div className="p-3 bg-light rounded-3 text-dark border fs-7 italic mt-1">
                    "{task.notes}"
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Required Supplies & Logistics */}
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-sm rounded-3 h-100 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">
                <i className="bi bi-box-seam text-primary me-2"></i>Supplies Requested
              </h5>

              <div className="mb-4">
                <span className="text-muted fs-7 text-uppercase fw-semibold d-block mb-2">Checklist to Deliver</span>
                <div className="d-flex flex-column gap-2">
                  {task.requiredSupplies?.map((supply, idx) => (
                    <div key={idx} className="p-2 border rounded-3 bg-light d-flex align-items-center gap-2">
                      <i className="bi bi-check-square-fill text-success fs-5"></i>
                      <span className="fw-medium text-dark">{supply}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Audit Log (FR-4.3) */}
              <div>
                <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1">
                  <i className="bi bi-clock-history text-secondary"></i> Status Audit History (FR-4.3)
                </h6>
                <div className="timeline-list border-start border-2 ps-3 ms-2">
                  {task.history?.map((h, idx) => (
                    <div key={idx} className="mb-3 position-relative">
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge ${getDispatchStatusBadgeClass(h.status)} px-2 py-1 fs-7`}>
                          {h.status.replace('_', ' ')}
                        </span>
                        <span className="fs-7 text-muted">{formatDate(h.timestamp)}</span>
                      </div>
                      <div className="fs-7 fw-semibold text-dark mt-1">{h.updatedBy}</div>
                      {h.note && <div className="fs-7 text-muted">{h.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}