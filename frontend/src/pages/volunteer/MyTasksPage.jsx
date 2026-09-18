import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { dispatchApi } from '../../api/dispatchApi';
import { formatDate, getUrgencyBadgeClass, getDispatchStatusBadgeClass } from '../../utils/helpers';
import toast from 'react-hot-toast';

export function MyTasksPage() {
  const { user, logout } = useAuthContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await dispatchApi.myTasks({
        status: statusFilter,
        search: searchTerm,
      });
      setTasks(res.content || []);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, searchTerm]);

  return (
    <div className="min-vh-100 bg-light animate-fade-in">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm glass">
        <div className="container max-w-6xl">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/volunteer">
            <i className="bi bi-people-fill text-warning"></i>
            <span>Volunteer Portal</span>
          </Link>
          <div className="navbar-nav ms-auto align-items-center gap-2">
            <Link to="/volunteer" className="btn btn-outline-light btn-sm rounded-pill px-3 me-2">
              <i className="bi bi-speedometer2 me-1"></i> Dashboard
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

      <main className="container max-w-6xl py-4">
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bolder text-dark mb-1">My Dispatch Tasks</h2>
            <p className="text-muted mb-0">Search and filter your entire assignment history and active field missions.</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="card border-0 shadow-sm rounded-3 mb-4 p-3 bg-white">
          <div className="row g-3 align-items-center">
            {/* Status Tabs */}
            <div className="col-12 col-md-7">
              <div className="btn-group w-100" role="group" aria-label="Status Filter">
                {['ALL', 'ASSIGNED', 'EN_ROUTE', 'DELIVERED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`btn btn-sm ${statusFilter === st ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st === 'ALL' ? 'All Tasks' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="col-12 col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="Search by Citizen, ID or supply..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    type="button"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">
              Assignments List ({tasks.length})
            </h5>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2 mb-0">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-3 text-muted opacity-50">
                  <i className="bi bi-inbox fs-1"></i>
                </div>
                <h5 className="fw-bold text-dark mb-1">No Tasks Found</h5>
                <p className="text-muted mb-0">No dispatch tasks match your current filter criteria.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light fs-7 text-uppercase text-muted">
                    <tr>
                      <th className="ps-4">Dispatch ID</th>
                      <th>Citizen Name</th>
                      <th>Urgency</th>
                      <th>Status</th>
                      <th>Required Supplies</th>
                      <th>Assigned Date</th>
                      <th className="pe-4 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td className="ps-4 fw-bold text-primary">
                          {task.id}
                          <div className="fs-7 text-muted fw-normal">{task.sosId}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{task.citizenName}</div>
                          <div className="fs-7 text-muted">
                            <i className="bi bi-telephone me-1"></i>{task.citizenPhone || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getUrgencyBadgeClass(task.urgencyLevel)} px-2 py-1`}>
                            {task.urgencyLevel}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getDispatchStatusBadgeClass(task.status)} px-2 py-1`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1 max-w-xs">
                            {task.requiredSupplies?.map((sup, i) => (
                              <span key={i} className="badge bg-light text-dark border fs-7 fw-normal">
                                {sup}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="fs-7 text-muted">
                          {formatDate(task.assignedAt)}
                        </td>
                        <td className="pe-4 text-end">
                          <Link
                            to={`/volunteer/tasks/${task.id}`}
                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                          >
                            <i className="bi bi-eye me-1"></i> View
                          </Link>
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