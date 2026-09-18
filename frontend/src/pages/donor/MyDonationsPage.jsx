import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export function MyDonationsPage() {
  const { user, logout } = useAuthContext();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await donationApi.my({ type: typeFilter });
      setDonations(res.content || res || []);
    } catch {
      toast.error('Failed to load donation history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [typeFilter]);

  const handlePrint = () => {
    window.print();
  };

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
            <Link to="/donor" className="btn btn-outline-light btn-sm rounded-pill px-3 me-2">
              <i className="bi bi-speedometer2 me-1"></i> Dashboard
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
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bolder text-dark mb-1">My Contribution History</h2>
            <p className="text-muted mb-0">View all your relief supply pledges, financial payments, and download official receipts.</p>
          </div>
          <Link to="/donate" className="btn btn-success rounded-pill px-4 shadow-sm fw-bold align-self-start align-self-md-center">
            <i className="bi bi-plus-circle me-2"></i>New Contribution
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div className="card border-0 shadow-sm rounded-3 mb-4 p-3 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <div className="btn-group w-100" role="group">
                {['ALL', 'GOODS', 'MONEY'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`btn btn-sm ${typeFilter === t ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}
                    onClick={() => setTypeFilter(t)}
                  >
                    {t === 'ALL' ? 'All Contributions' : t === 'GOODS' ? 'Goods Pledges' : 'Financial'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">Contribution Log ({donations.length})</h5>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2 mb-0">Loading donation history...</p>
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-heart fs-1 text-muted d-block mb-2 opacity-50"></i>
                <h5 className="fw-bold text-dark mb-1">No Donations Found</h5>
                <p className="text-muted mb-0">You have no recorded contributions under this filter.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light fs-7 text-uppercase text-muted">
                    <tr>
                      <th className="ps-4">Ref ID</th>
                      <th>Type</th>
                      <th>Contribution Details</th>
                      <th>Status</th>
                      <th>Submitted Date</th>
                      <th className="pe-4 text-end">Receipt Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d) => (
                      <tr key={d.id}>
                        <td className="ps-4 fw-bold text-primary fs-7">{d.id}</td>
                        <td>
                          <span className={`badge ${d.type === 'GOODS' ? 'bg-info text-dark' : 'bg-success'} px-2 py-1`}>
                            {d.type === 'GOODS' ? 'Goods Pledge' : 'Financial'}
                          </span>
                        </td>
                        <td>
                          {d.type === 'GOODS' ? (
                            <div>
                              <strong className="text-dark">{d.itemName}</strong>
                              <div className="fs-7 text-muted">{d.quantity} {d.unit || 'units'}</div>
                            </div>
                          ) : (
                            <div>
                              <strong className="text-success">₹{d.amount?.toLocaleString()}</strong>
                              <div className="fs-7 text-muted font-monospace">{d.transactionRef}</div>
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${d.status === 'APPROVED' || d.status === 'VERIFIED' ? 'bg-success' : 'bg-warning text-dark'} px-2 py-1`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="fs-7 text-muted">{formatDate(d.createdAt)}</td>
                        <td className="pe-4 text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            onClick={() => setSelectedReceipt(d)}
                          >
                            <i className="bi bi-receipt me-1"></i> Receipt
                          </button>
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

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-primary text-white py-3">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check text-warning"></i> Contribution Receipt
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedReceipt(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="text-center mb-4 pb-3 border-bottom">
                  <h4 className="fw-bolder text-dark mb-1">Disaster Relief Coordinator</h4>
                  <span className="fs-7 text-muted">Official Contribution Acknowledgment</span>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between fs-7 border-bottom pb-1 mb-2">
                    <span className="text-muted">Receipt Number:</span>
                    <strong className="text-primary font-monospace">{selectedReceipt.id}</strong>
                  </div>
                  <div className="d-flex justify-content-between fs-7 border-bottom pb-1 mb-2">
                    <span className="text-muted">Donor Name:</span>
                    <strong className="text-dark">{selectedReceipt.donorName || user?.name}</strong>
                  </div>
                  <div className="d-flex justify-content-between fs-7 border-bottom pb-1 mb-2">
                    <span className="text-muted">Donor Email:</span>
                    <span className="text-dark">{selectedReceipt.donorEmail || user?.email}</span>
                  </div>
                  <div className="d-flex justify-content-between fs-7 border-bottom pb-1 mb-2">
                    <span className="text-muted">Contribution Type:</span>
                    <span className="badge bg-light text-dark border">{selectedReceipt.type === 'GOODS' ? 'Goods Pledge' : 'Monetary Contribution'}</span>
                  </div>
                  {selectedReceipt.type === 'GOODS' ? (
                    <div className="d-flex justify-content-between fs-7 border-bottom pb-1 mb-2">
                      <span className="text-muted">Pledged Item & Quantity:</span>
                      <strong className="text-dark">{selectedReceipt.quantity} {selectedReceipt.unit} of {selectedReceipt.itemName}</strong>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between fs-7 border-bottom pb-1 mb-2">
                        <span className="text-muted">Amount Donated:</span>
                        <strong className="text-success fs-6">₹{selectedReceipt.amount?.toLocaleString()}</strong>
                      </div>
                      <div className="d-flex justify-content-between fs-7 border-bottom pb-1 mb-2">
                        <span className="text-muted">Transaction Reference:</span>
                        <span className="font-monospace text-dark">{selectedReceipt.transactionRef}</span>
                      </div>
                    </>
                  )}
                  <div className="d-flex justify-content-between fs-7">
                    <span className="text-muted">Status:</span>
                    <span className="badge bg-success">{selectedReceipt.status}</span>
                  </div>
                </div>

                <div className="alert alert-light border fs-7 text-center text-muted mb-0">
                  Thank you for empowering disaster relief operations.
                </div>
              </div>

              <div className="modal-footer bg-light py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-3 rounded-pill"
                  onClick={() => setSelectedReceipt(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm px-4 rounded-pill fw-bold"
                  onClick={handlePrint}
                >
                  <i className="bi bi-printer me-1"></i> Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}