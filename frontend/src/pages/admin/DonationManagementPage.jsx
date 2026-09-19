import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export function DonationManagementPage() {
  const { user, logout } = useAuthContext();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [processingId, setProcessingId] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await donationApi.list({
        type: typeFilter,
        status: statusFilter,
      });
      setDonations(res.content || res || []);
    } catch {
      toast.error('Failed to load donation pledges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [typeFilter, statusFilter]);

  const handleApprovePledge = async (id, itemName, quantity) => {
    try {
      setProcessingId(id);
      await donationApi.approvePledge(id);
      toast.success(`Pledge approved! Added ${quantity} units of ${itemName} directly to relief inventory.`);
      await fetchDonations();
    } catch {
      toast.error('Failed to approve pledge');
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerifyPayment = async (id) => {
    try {
      setProcessingId(id);
      await donationApi.verifyPayment(id);
      toast.success('Monetary donation verified!');
      await fetchDonations();
    } catch {
      toast.error('Failed to verify payment');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'VERIFIED': return 'bg-success';
      case 'PENDING': return 'bg-warning text-dark';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-secondary';
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
          <button 
            className="navbar-toggler border-0 shadow-none" 
            type="button" 
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse justify-content-end mt-3 mt-lg-0`}>
            <div className="navbar-nav align-items-center gap-2">
              <Link to="/admin" className="nav-custom-link">
                <i className="bi bi-speedometer2"></i> Dashboard
              </Link>
              <div className="nav-custom-badge">
                <i className="bi bi-person-circle fs-5"></i>
                <span className="text-truncate" style={{ maxWidth: '120px' }}>{user?.name || 'Admin'}</span>
              </div>
              <button
                type="button"
                className="nav-logout-btn"
                onClick={logout}
              >
                Logout <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container max-w-6xl py-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bolder text-dark mb-1">Donation & Pledge Approvals</h2>
            <p className="text-muted mb-0">Approve pledged relief supplies (which automatically increment warehouse stock) and verify financial transactions.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm rounded-3 mb-4 p-3 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">Donation Type Filter</label>
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">All Donation Types</option>
                <option value="GOODS">Relief Goods Pledges</option>
                <option value="MONEY">Financial Donations</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">Approval Status</label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved / Stocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donations Table */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">Pledges & Financial Contributions ({donations.length})</h5>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2 mb-0">Loading pledge records...</p>
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-heart fs-1 text-muted d-block mb-2 opacity-50"></i>
                <h5 className="fw-bold text-dark mb-1">No Pledges Found</h5>
                <p className="text-muted mb-0">No donations match your selected filter criteria.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light fs-7 text-uppercase text-muted">
                    <tr>
                      <th className="ps-4">Pledge ID</th>
                      <th>Donor Information</th>
                      <th>Type</th>
                      <th>Pledge Details</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th className="pe-4 text-end">Approval Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d) => (
                      <tr key={d.id}>
                        <td className="ps-4 fw-bold text-primary fs-7">{d.id}</td>
                        <td>
                          <div className="fw-bold text-dark">{d.donorName}</div>
                          <div className="fs-7 text-muted">{d.donorEmail}</div>
                        </td>
                        <td>
                          <span className={`badge ${d.type === 'GOODS' ? 'bg-info text-dark' : 'bg-success'} px-2 py-1`}>
                            {d.type === 'GOODS' ? 'Goods Pledge' : 'Financial'}
                          </span>
                        </td>
                        <td>
                          {d.type === 'GOODS' ? (
                            <div>
                              <strong className="text-dark">{d.itemName}</strong>
                              <div className="fs-7 text-muted">{d.quantity} units</div>
                            </div>
                          ) : (
                            <div>
                              <strong className="text-success">₹{d.amount?.toLocaleString()}</strong>
                              <div className="fs-7 text-muted font-monospace">{d.transactionRef}</div>
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(d.status)} px-2 py-1`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="fs-7 text-muted">{formatDate(d.createdAt)}</td>
                        <td className="pe-4 text-end">
                          {d.status === 'PENDING' && d.type === 'GOODS' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-success rounded-pill px-3 fw-bold"
                              disabled={processingId === d.id}
                              onClick={() => handleApprovePledge(d.id, d.itemName, d.quantity)}
                            >
                              {processingId === d.id ? 'Approving...' : 'Approve & Increment Inventory'}
                            </button>
                          )}

                          {d.status === 'PENDING' && d.type === 'MONEY' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-primary rounded-pill px-3 fw-bold"
                              disabled={processingId === d.id}
                              onClick={() => handleVerifyPayment(d.id)}
                            >
                              {processingId === d.id ? 'Verifying...' : 'Verify Payment'}
                            </button>
                          )}

                          {d.status !== 'PENDING' && (
                            <span className="fs-7 text-muted italic">
                              <i className="bi bi-check-all text-success me-1"></i>Completed
                            </span>
                          )}
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