import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-vh-100 d-flex flex-column animate-fade-in">
      <nav className="navbar navbar-dark bg-primary fixed-top glass py-2" style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container d-flex align-items-center justify-content-between flex-nowrap">
          <Link className="navbar-brand d-flex align-items-center gap-2 me-2 text-truncate fw-bold" to="/">
            <i className="bi bi-shield-check fs-4 text-warning flex-shrink-0"></i>
            <span className="text-truncate">Disaster Relief</span>
          </Link>
          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            <Link className="btn btn-outline-light btn-sm px-3 rounded-pill" to="/login">Login</Link>
            <Link className="btn btn-light text-primary btn-sm px-3 fw-bold rounded-pill shadow-sm hover-lift" to="/register">Register</Link>
          </div>
        </div>
      </nav>

      <main className="flex-fill d-flex align-items-center" style={{ marginTop: '76px', background: 'linear-gradient(135deg, var(--er-blue-50) 0%, var(--er-gray-50) 100%)' }}>
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="badge bg-primary bg-opacity-10 text-primary mb-3 px-3 py-2 fs-6">
                <i className="bi bi-lightning-charge-fill me-2"></i>Rapid Response Network
              </span>
              <h1 className="display-4 fw-bolder text-dark mb-4" style={{ letterSpacing: '-1px' }}>
                Coordinate Relief.<br />
                <span className="text-primary">Save Lives.</span>
              </h1>
              <p className="lead text-muted mb-5 pe-lg-5">
                A unified platform connecting citizens, volunteers, and administrators for efficient, real-time emergency disaster response and resource dispatch.
              </p>
              <div className="d-flex gap-3 justify-content-center justify-content-lg-start flex-wrap">
                <Link to="/register" className="btn btn-primary btn-lg px-5 py-3 hover-lift shadow-sm d-flex align-items-center gap-2">
                  Get Started <i className="bi bi-arrow-right"></i>
                </Link>
                <Link to="/donate" className="btn btn-outline-primary btn-lg px-5 py-3 hover-lift bg-white">
                  <i className="bi bi-heart-fill text-danger me-2"></i> Donate Now
                </Link>
              </div>
            </div>
            
            <div className="col-lg-6 d-none d-lg-block">
              <div className="position-relative">
                {/* Decorative abstract UI composition */}
                <div className="card shadow-lg border-0 glass hover-lift" style={{ transform: 'rotate(2deg)' }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h5 className="fw-bold mb-1">SOS Request #492</h5>
                        <p className="text-muted small mb-0">Flood Evacuation Needed</p>
                      </div>
                      <span className="badge badge-urgency-high">High Urgency</span>
                    </div>
                    <div className="bg-light p-3 rounded-3 border mb-3">
                      <div className="text-dark small mb-1">
                        <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                        <strong>Location:</strong> Kurla West, Mumbai (Lat: 19.076, Lng: 72.877)
                      </div>
                      <div className="text-muted small">
                        <i className="bi bi-info-circle me-1"></i>
                        Water level rising rapidly. Family of 4 trapped on ground floor requires urgent evacuation & drinking water.
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                      <span className="badge badge-status-assigned"><i className="bi bi-person-check me-1"></i> Volunteer Assigned</span>
                      <small className="text-muted">2 mins ago</small>
                    </div>
                  </div>
                </div>
                
                {/* Secondary floating card */}
                <div className="card shadow border-0 position-absolute glass hover-lift" style={{ bottom: '-30px', left: '-40px', width: '220px', transform: 'rotate(-3deg)' }}>
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-success bg-opacity-10 text-success p-2 rounded-circle">
                        <i className="bi bi-box-seam fs-4"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0">Supplies</h6>
                        <small className="text-muted">En Route</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white py-4 mt-auto border-top">
        <div className="container text-center text-muted small">
          &copy; 2026 Disaster Relief Coordinator. All rights reserved.
        </div>
      </footer>
    </div>
  );
}