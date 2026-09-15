import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export function DonorDashboard() {
  const { user, logout } = useAuthContext();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDonorData() {
      try {
        setLoading(true);
        const res = await donationApi.list({ status: 'ALL' });
        setDonations(res.content || res || []);
      } catch {
        toast.error('Failed to load donation history');
      } finally {
        setLoading(false);
      }
    }
    loadDonorData();
  }, []);

  const totalPledges = donations.length;
  const approvedGoods = donations.filter(d => d.type === 'GOODS' && d.status === 'APPROVED');
  const totalMoneyVerified = donations
    .filter(d => d.type === 'MONEY' && d.status === 'VERIFIED')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const pendingCount = donations.filter(d => d.status === 'PENDING').length;

  return (
    <div className="min-vh-100 bg-light animate-fade-in">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm glass">
        <div className="container max-w-6xl">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/donor">
            <i className="bi bi-heart-fill text-warning"></i>
            <span>Donor Portal</span>
          </Link>
          <div className="navbar-nav ms-auto align-items-center gap-2">
            <Link to="/donor/donations" className="btn btn-outline-light btn-sm rounded-pill px-3 me-2">
              <i className="bi bi-receipt me-1"></i> My History
            </Link>
            <div className="d-flex align-items-center gap-2 text-white bg-white bg-opacity-10 px-3 py-1 rounded-pill">
              <i className="bi bi-person-circle"></i>
              <span className="fw-medium">{user?.name || 'Donor'}</span>
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
        {/* Welcome Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bolder text-dark mb-1">Donor Impact Dashboard</h2>
            <p className="text-muted mb-0">Track your relief supply pledges, financial contributions, and community impact.</p>
          </div>
          <Link to="/donate" className="btn btn-success rounded-pill px-4 shadow-sm fw-bold align-self-start align-self-md-center">
            <i className="bi bi-plus-circle me-2"></i>Make New Contribution
          </Link>
        </div>

        {/* Impact Metrics Grid */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-primary border-4 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Total Pledges</span>
                  <h2 className="fw-bold mb-0 text-primary">{loading ? '...' : totalPledges}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                  <i className="bi bi-gift fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-success border-4 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Approved Supplies</span>
                  <h2 className="fw-bold mb-0 text-success">{loading ? '...' : approvedGoods.length}</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                  <i className="bi bi-box-seam fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-info border-4 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Financial Support</span>
                  <h2 className="fw-bold mb-0 text-info">₹{loading ? '...' : totalMoneyVerified.toLocaleString()}</h2>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded-circle text-info">
                  <i className="bi bi-currency-rupee fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-warning border-4 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Pending Review</span>
                  <h2 className="fw-bold mb-0 text-warning">{loading ? '...' : pendingCount}</h2>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                  <i className="bi bi-clock-history fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Contributions Section */}
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 className="fw-bold mb-0 text-dark">Recent Pledges & Donations</h5>
            <Link to="/donor/donations" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
              View History
            </Link>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2 mb-0">Loading your contributions...</p>
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-heart fs-1 text-muted d-block mb-2 opacity-50"></i>
                <h5 className="fw-bold text-dark mb-1">No Contributions Yet</h5>
                <p className="text-muted mb-3 max-w-md mx-auto">Your support directly aids families affected by disaster events.</p>
                <Link to="/donate" className="btn btn-success rounded-pill px-4 fw-bold">
                  Make First Contribution
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light fs-7 text-uppercase text-muted">
                    <tr>
                      <th className="ps-4">Ref ID</th>
                      <th>Type</th>
                      <th>Details</th>
                      <th>Status</th>
                      <th>Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.slice(0, 5).map((d) => (
                      <tr key={d.id}>
                        <td className="ps-4 fw-bold text-primary fs-7">{d.id}</td>
                        <td>
                          <span className={`badge ${d.type === 'GOODS' ? 'bg-info text-dark' : 'bg-success'} px-2 py-1`}>
                            {d.type === 'GOODS' ? 'Goods Pledge' : 'Financial'}
                          </span>
                        </td>
                        <td>
                          {d.type === 'GOODS' ? (
                            <span className="fw-semibold text-dark">{d.quantity} {d.unit || 'units'} of {d.itemName}</span>
                          ) : (
                            <span className="fw-bold text-success">₹{d.amount?.toLocaleString()}</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${d.status === 'APPROVED' || d.status === 'VERIFIED' ? 'bg-success' : 'bg-warning text-dark'} px-2 py-1`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="fs-7 text-muted">{formatDate(d.createdAt)}</td>
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