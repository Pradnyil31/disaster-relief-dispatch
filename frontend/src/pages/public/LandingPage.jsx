import { Link } from 'react-router-dom';
import { useState } from 'react';

export function LandingPage() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  return (
    <div className="min-vh-100 d-flex flex-column animate-fade-in">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top glass py-2" style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2 me-2 text-truncate fw-bold" to="/">
            <i className="bi bi-shield-check fs-4 text-warning flex-shrink-0"></i>
            <span className="text-truncate">Disaster Relief</span>
          </Link>
          <button 
            className="navbar-toggler border-0 shadow-none bg-light bg-opacity-10 rounded-3 p-2" 
            type="button" 
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          >
            <i className={`bi ${isNavCollapsed ? 'bi-list' : 'bi-x-lg'} fs-4 text-white`}></i>
          </button>

          <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse justify-content-end mt-3 mt-lg-0`}>
            <div className="navbar-nav align-items-lg-center flex-lg-row gap-2 gap-lg-3">
              <a href="#about-us" className="nav-custom-link w-100 w-lg-auto text-nowrap" onClick={() => setIsNavCollapsed(true)}>About Us</a>
              <Link className="btn btn-outline-light btn-sm px-4 rounded-pill w-100 w-lg-auto mb-2 mb-lg-0 text-nowrap" to="/login">Login</Link>
              <Link className="btn btn-light text-primary btn-sm px-4 fw-bold rounded-pill shadow-sm hover-lift w-100 w-lg-auto text-nowrap" to="/register">Register</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="d-flex align-items-center py-5" style={{ minHeight: '100vh', marginTop: '0', paddingTop: '76px', background: 'linear-gradient(135deg, var(--er-blue-50) 0%, var(--er-gray-50) 100%)' }}>
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
              <p className="lead text-dark fw-medium mb-2 pe-lg-5">
                Welcome to the <strong>Emergency Resource and Disaster Relief Dispatch Coordinator</strong>.
              </p>
              <p className="text-muted mb-5 pe-lg-5 fs-5">
                A unified platform connecting citizens, volunteers, and administrators for efficient, real-time emergency response and resource dispatch.
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

      {/* About Us Section */}
      <section id="about-us" className="py-5 bg-white">
        <div className="container py-lg-5 my-4">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center">
              <span className="text-primary fw-bold text-uppercase tracking-wide small mb-2 d-block">Who We Are</span>
              <h2 className="fw-bold display-5 mb-4 text-dark">About Us</h2>
              <p className="lead text-muted">
                We are a dedicated team of volunteers, administrators, and citizens working together to provide rapid, organized, and effective disaster relief where it's needed most.
              </p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <div className="p-4 p-xl-5 bg-light rounded-4 h-100 hover-lift transition-all border border-light">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-3 mb-4 shadow-sm">
                  <i className="bi bi-bullseye fs-2"></i>
                </div>
                <h4 className="fw-bold mb-3">Our Mission</h4>
                <p className="text-muted mb-0">To ensure timely and equitable distribution of life-saving resources during crises, bridging the gap between donors, volunteers, and affected citizens.</p>
              </div>
            </div>
            
            <div className="col-md-4 text-center">
              <div className="p-4 p-xl-5 bg-light rounded-4 h-100 hover-lift transition-all border border-light">
                <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex p-3 mb-4 shadow-sm">
                  <i className="bi bi-people-fill fs-2"></i>
                </div>
                <h4 className="fw-bold mb-3">Community First</h4>
                <p className="text-muted mb-0">A collaborative network driven by community action. Our platform empowers ordinary people to become extraordinary responders when disaster strikes.</p>
              </div>
            </div>
            
            <div className="col-md-4 text-center">
              <div className="p-4 p-xl-5 bg-light rounded-4 h-100 hover-lift transition-all border border-light">
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex p-3 mb-4 shadow-sm">
                  <i className="bi bi-lightning-charge-fill fs-2"></i>
                </div>
                <h4 className="fw-bold mb-3">Our Impact</h4>
                <p className="text-muted mb-0">Through real-time SOS tracking and intelligent inventory dispatch, we've drastically reduced emergency response times and optimized resource allocation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-dark text-white py-5 mt-auto">
        <div className="container text-center text-white-50">
          <div className="mb-3 d-flex justify-content-center gap-3 fs-5">
            <a href="https://x.com/PradnyilPatil31" target="_blank" rel="noopener noreferrer" className="text-white-50 hover-text-white transition-all"><i className="bi bi-twitter-x"></i></a>
            <a href="https://github.com/Pradnyil31/" target="_blank" rel="noopener noreferrer" className="text-white-50 hover-text-white transition-all"><i className="bi bi-github"></i></a>
            <a href="mailto:patilpradnyil1@gmail.com" className="text-white-50 hover-text-white transition-all"><i className="bi bi-envelope"></i></a>
          </div>
          <p className="mb-0">&copy; 2026 Emergency Resource and Disaster Relief Dispatch Coordinator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}