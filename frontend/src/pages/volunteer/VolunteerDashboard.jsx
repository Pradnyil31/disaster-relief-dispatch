import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { dispatchApi } from '../../api/dispatchApi';
import { formatDate, getUrgencyBadgeClass, getDispatchStatusBadgeClass } from '../../utils/helpers';
import toast from 'react-hot-toast';

export function VolunteerDashboard() {
  const { user, logout } = useAuthContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await dispatchApi.myTasks();
      setTasks(res.content || []);
    } catch {
      toast.error('Failed to load dispatch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleQuickStatusUpdate = async (taskId, newStatus) => {
    try {
      setUpdatingId(taskId);
      await dispatchApi.updateStatus(taskId, newStatus);
      toast.success(`Task status updated to ${newStatus.replace('_', ' ')}`);
      await fetchTasks();
    } catch {
      toast.error('Failed to update task status');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeTasks = tasks.filter(t => t.status === 'ASSIGNED' || t.status === 'EN_ROUTE');
  const enRouteTasks = tasks.filter(t => t.status === 'EN_ROUTE');
  const deliveredTasks = tasks.filter(t => t.status === 'DELIVERED');

  return (
    <div className="min-vh-100 bg-light animate-fade-in">
      {/* Top Navbar */}
      <nav className="navbar navbar-dark bg-primary sticky-top shadow-sm glass py-2">
        <div className="container max-w-6xl d-flex align-items-center justify-content-between flex-nowrap">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-6 fs-sm-5 mb-0" to="/volunteer">
            <i className="bi bi-people-fill text-warning"></i>
            <span>Volunteer Portal</span>
          </Link>
          <div className="d-flex align-items-center gap-2">
            <Link to="/volunteer/tasks" className="btn btn-outline-light btn-sm rounded-pill px-2 px-sm-3 me-1 fs-7">
              <i className="bi bi-list-task me-1"></i> <span className="d-none d-sm-inline">My Tasks</span>
            </Link>
            <div className="d-none d-md-flex align-items-center gap-2 text-white bg-white bg-opacity-10 px-3 py-1 rounded-pill fs-7">
              <i className="bi bi-person-circle"></i>
              <span className="fw-medium text-truncate" style={{ maxWidth: '120px' }}>{user?.name || 'Volunteer'}</span>
            </div>
            <button
              type="button"
              className="btn btn-outline-light btn-sm px-3 rounded-pill hover-lift fs-7 fw-semibold"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container max-w-6xl py-4">
        {/* Welcome Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bolder text-dark mb-1">Field Operations Dashboard</h2>
            <p className="text-muted mb-0">View assigned disaster relief tasks and update delivery status in real-time.</p>
          </div>
          <Link to="/volunteer/tasks" className="btn btn-primary rounded-pill px-4 shadow-sm align-self-start align-self-md-center">
            <i className="bi bi-card-checklist me-2"></i>View All Tasks ({tasks.length})
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-primary border-4 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Active Assignments</span>
                  <h2 className="fw-bold mb-0 text-primary">{activeTasks.length}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                  <i className="bi bi-truck fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-warning border-4 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">En Route to Citizen</span>
                  <h2 className="fw-bold mb-0 text-warning">{enRouteTasks.length}</h2>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                  <i className="bi bi-geo-alt-fill fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-success border-4 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Delivered / Completed</span>
                  <h2 className="fw-bold mb-0 text-success">{deliveredTasks.length}</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                  <i className="bi bi-check-circle-fill fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Tasks List */}
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-lightning-charge-fill text-warning"></i> Active Dispatch Assignments
            </h5>
            <span className="badge bg-primary rounded-pill px-3 py-2">{activeTasks.length} Pending</span>
          </div>

          <div className="card-body p-3">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2 mb-0">Fetching your assigned tasks...</p>
              </div>
            ) : activeTasks.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-3 text-muted opacity-50">
                  <i className="bi bi-check2-circle fs-1 text-success"></i>
                </div>
                <h5 className="fw-bold text-dark mb-1">No Active Tasks</h5>
                <p className="text-muted mb-0">You're all caught up! When admins assign new SOS dispatches, they will show up here.</p>
              </div>
            ) : (
              <div className="row g-3">
                {activeTasks.map(task => (
                  <div key={task.id} className="col-12 col-lg-6">
                    <div className="card border rounded-3 p-3 h-100 bg-white hover-shadow transition-all">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="fw-bold fs-6 text-primary me-2">{task.id}</span>
                          <span className="text-muted fs-7">({task.sosId})</span>
                        </div>
                        <div className="d-flex gap-1">
                          <span className={`badge ${getUrgencyBadgeClass(task.urgencyLevel)} px-2 py-1`}>
                            {task.urgencyLevel} Urgency
                          </span>
                          <span className={`badge ${getDispatchStatusBadgeClass(task.status)} px-2 py-1`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                        <i className="bi bi-person-fill text-secondary"></i> {task.citizenName}
                      </h5>
                      <p className="text-muted fs-7 mb-2 d-flex align-items-center gap-1">
                        <i className="bi bi-geo-alt text-danger"></i> {task.locationName || `${task.latitude}, ${task.longitude}`}
                      </p>

                      {/* Required supplies list */}
                      <div className="mb-3">
                        <span className="fs-7 text-uppercase text-muted fw-semibold d-block mb-1">Supplies Needed:</span>
                        <div className="d-flex flex-wrap gap-1">
                          {task.requiredSupplies?.map((s, idx) => (
                            <span key={idx} className="badge bg-light text-dark border px-2 py-1 fs-7 fw-normal">
                              <i className="bi bi-box-seam me-1 text-primary"></i>{s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                        <Link to={`/volunteer/tasks/${task.id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                          <i className="bi bi-info-circle me-1"></i> Details
                        </Link>

                        {task.status === 'ASSIGNED' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-warning rounded-pill px-3 text-dark fw-semibold"
                            disabled={updatingId === task.id}
                            onClick={() => handleQuickStatusUpdate(task.id, 'EN_ROUTE')}
                          >
                            {updatingId === task.id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1"></span> Updating...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-geo-alt me-1"></i> Start En Route
                              </>
                            )}
                          </button>
                        )}

                        {task.status === 'EN_ROUTE' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success rounded-pill px-3 fw-semibold"
                            disabled={updatingId === task.id}
                            onClick={() => handleQuickStatusUpdate(task.id, 'DELIVERED')}
                          >
                            {updatingId === task.id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1"></span> Updating...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-1"></i> Mark Delivered
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}