import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { sosApi } from '../../api/sosApi';
import { dispatchApi } from '../../api/dispatchApi';
import { inventoryApi } from '../../api/inventoryApi';
import { donationApi } from '../../api/donationApi';

export function AdminDashboard() {
  const { user, logout } = useAuthContext();
  const [stats, setStats] = useState({
    pendingSos: 0,
    activeDispatches: 0,
    lowStockCount: 0,
    pendingDonations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [sosRes, dispatchRes, invLow, donRes] = await Promise.all([
          sosApi.list({ status: 'PENDING' }),
          dispatchApi.list({ status: 'ALL' }),
          inventoryApi.lowStock(),
          donationApi.list({ status: 'PENDING' }),
        ]);

        const pendingSos = sosRes?.content ? sosRes.content.filter(s => s.status === 'PENDING').length : (sosRes?.length || 0);
        const activeDispatches = dispatchRes?.content ? dispatchRes.content.filter(d => d.status === 'ASSIGNED' || d.status === 'EN_ROUTE').length : 0;
        const lowStockCount = Array.isArray(invLow) ? invLow.length : 0;
        const pendingDonations = donRes?.content ? donRes.content.filter(d => d.status === 'PENDING').length : 0;

        setStats({
          pendingSos,
          activeDispatches,
          lowStockCount,
          pendingDonations,
        });
      } catch {
        // quiet fallback
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-vh-100 bg-light animate-fade-in">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm glass">
        <div className="container max-w-6xl">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/admin">
            <i className="bi bi-shield-lock-fill text-warning"></i>
            Admin Command Center
          </Link>
          <div className="navbar-nav ms-auto align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 text-white bg-white bg-opacity-10 px-3 py-1 rounded-pill">
              <i className="bi bi-person-badge"></i>
              <span className="fw-medium">{user?.name || 'Administrator'}</span>
            </div>
            <button
              type="button"
              className="btn btn-outline-light btn-sm px-3 rounded-pill hover-lift"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container max-w-6xl py-4">
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bolder text-dark mb-1">System Operations Command</h2>
            <p className="text-muted mb-0">Overview of active emergency dispatches, pending SOS alerts, and resource levels.</p>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-primary border-4 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Pending SOS</span>
                  <h2 className="fw-bold mb-0 text-primary">{loading ? '...' : stats.pendingSos}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                  <i className="bi bi-exclamation-triangle fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-warning border-4 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Active Dispatches</span>
                  <h2 className="fw-bold mb-0 text-warning">{loading ? '...' : stats.activeDispatches}</h2>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                  <i className="bi bi-truck fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-danger border-4 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Low Stock Items</span>
                  <h2 className="fw-bold mb-0 text-danger">{loading ? '...' : stats.lowStockCount}</h2>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger">
                  <i className="bi bi-box-seam fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-success border-4 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Pending Pledges</span>
                  <h2 className="fw-bold mb-0 text-success">{loading ? '...' : stats.pendingDonations}</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                  <i className="bi bi-heart fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Management Links */}
        <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
          <div className="card-header bg-white py-3">
            <h5 className="fw-bold mb-0 text-dark">Coordinator Control Panels</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-4">
                <Link to="/admin/sos" className="card border p-3 h-100 text-decoration-none hover-shadow transition-all">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary">
                      <i className="bi bi-inbox fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-1">SOS Requests (FR-2.4)</h6>
                      <p className="fs-7 text-muted mb-0">View, search, filter by urgency, & assign dispatch.</p>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <Link to="/admin/inventory" className="card border p-3 h-100 text-decoration-none hover-shadow transition-all">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-danger bg-opacity-10 p-3 rounded-3 text-danger">
                      <i className="bi bi-box-seam fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-1">Inventory (FR-3.3/3.4)</h6>
                      <p className="fs-7 text-muted mb-0">Manage supplies, threshold alerts & category filters.</p>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <Link to="/admin/dispatch" className="card border p-3 h-100 text-decoration-none hover-shadow transition-all">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-warning bg-opacity-10 p-3 rounded-3 text-warning">
                      <i className="bi bi-truck fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-1">Manual Dispatch (FR-4.1)</h6>
                      <p className="fs-7 text-muted mb-0">Link SOS alerts directly to available volunteers.</p>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <Link to="/admin/volunteers" className="card border p-3 h-100 text-decoration-none hover-shadow transition-all">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-info bg-opacity-10 p-3 rounded-3 text-info">
                      <i className="bi bi-people fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-1">Volunteers Roster</h6>
                      <p className="fs-7 text-muted mb-0">Track volunteer status, zones & availability.</p>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <Link to="/admin/donations" className="card border p-3 h-100 text-decoration-none hover-shadow transition-all">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-success bg-opacity-10 p-3 rounded-3 text-success">
                      <i className="bi bi-gift fs-4"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-1">Donation Pledges (FR-5.1)</h6>
                      <p className="fs-7 text-muted mb-0">Approve goods pledges & auto-increment inventory stock.</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}