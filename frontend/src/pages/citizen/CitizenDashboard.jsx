import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

export function CitizenDashboard() {
  const { user, logout } = useAuthContext();

  return (
    <div className="min-vh-100 bg-light animate-fade-in">
      {/* Top Navigation */}
      <nav className="navbar navbar-dark bg-primary sticky-top shadow-sm glass py-2">
        <div className="container max-w-6xl d-flex align-items-center justify-content-between flex-nowrap">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-6 fs-sm-5 mb-0" to="/citizen">
            <i className="bi bi-shield-check text-warning"></i>
            <span>Citizen Portal</span>
          </Link>
          <div className="d-flex align-items-center gap-2">
            <div className="d-none d-sm-flex align-items-center gap-2 text-white bg-white bg-opacity-10 px-3 py-1 rounded-pill fs-7">
              <i className="bi bi-person-circle"></i>
              <span className="fw-medium text-truncate" style={{ maxWidth: '120px' }}>{user?.name}</span>
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

      {/* Main Content Area */}
      <main className="container max-w-6xl py-5">
        
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h2 className="fw-bolder text-dark mb-1">My Dashboard</h2>
            <p className="text-muted mb-0">Manage your emergency requests and view real-time updates.</p>
          </div>
          <Link to="/citizen/sos/new" className="btn btn-danger btn-lg shadow-sm hover-lift d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            New SOS Request
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-stats-grid mb-5">
          <div className="card border-0 hover-lift delay-100">
            <div className="card-body d-flex align-items-center gap-4">
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                <i className="bi bi-broadcast fs-3"></i>
              </div>
              <div>
                <p className="text-muted fw-medium mb-1 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Total Requests</p>
                <h3 className="fw-bolder mb-0 text-dark">0</h3>
              </div>
            </div>
          </div>
          
          <div className="card border-0 hover-lift delay-200">
            <div className="card-body d-flex align-items-center gap-4">
              <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                <i className="bi bi-hourglass-split fs-3"></i>
              </div>
              <div>
                <p className="text-muted fw-medium mb-1 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Pending</p>
                <h3 className="fw-bolder mb-0 text-dark">0</h3>
              </div>
            </div>
          </div>

          <div className="card border-0 hover-lift delay-300">
            <div className="card-body d-flex align-items-center gap-4">
              <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                <i className="bi bi-check2-circle fs-3"></i>
              </div>
              <div>
                <p className="text-muted fw-medium mb-1 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Resolved</p>
                <h3 className="fw-bolder mb-0 text-dark">0</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests Section */}
        <div className="card border-0 mb-4 animate-fade-in delay-300">
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 className="fw-bold mb-0">Recent SOS Requests</h5>
            <Link to="/citizen/sos" className="btn btn-sm btn-outline-secondary">View All</Link>
          </div>
          <div className="card-body p-0">
            {/* Empty State */}
            <div className="text-center py-5">
              <div className="mb-4 text-muted opacity-50">
                <i className="bi bi-inbox fs-1"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">No SOS requests yet</h5>
              <p className="text-muted mb-4 max-w-md">You haven't submitted any emergency requests. If you or someone else needs immediate assistance, click the button below.</p>
              <Link to="/citizen/sos/new" className="btn btn-outline-primary shadow-sm hover-lift">
                Submit SOS Request
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}