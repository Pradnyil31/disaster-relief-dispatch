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
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '640px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              {/* Screen Modal Header - Hidden in Print */}
              <div className="modal-header bg-primary text-white py-3 px-4 no-print">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check text-warning"></i> Contribution Receipt
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedReceipt(null)}
                ></button>
              </div>

              <div className="modal-body p-4 p-md-5 bg-white">
                {/* Official Organization Header */}
                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: '48px', height: '48px', minWidth: '48px' }}
                    >
                      <i className="bi bi-shield-check fs-4 text-warning"></i>
                    </div>
                    <div>
                      <h4 className="fw-bolder text-dark mb-0">Disaster Relief Operations</h4>
                      <span className="fs-8 text-muted text-uppercase fw-semibold">Official Contribution & Donation Acknowledgment</span>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-primary fs-7 px-3 py-1 font-monospace">#{selectedReceipt.id}</span>
                    <div className="fs-8 text-muted mt-1">{formatDate(selectedReceipt.createdAt || new Date())}</div>
                  </div>
                </div>

                {/* Donor Particulars Box */}
                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <div className="row g-2">
                    <div className="col-6">
                      <span className="text-muted fs-8 text-uppercase fw-semibold d-block">Donor Name</span>
                      <strong className="text-dark fs-6">{selectedReceipt.donorName || user?.name || 'Valued Contributor'}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted fs-8 text-uppercase fw-semibold d-block">Donor Email</span>
                      <span className="text-dark fs-7">{selectedReceipt.donorEmail || user?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Contribution Itemized Table */}
                <div className="table-responsive mb-3">
                  <table className="table table-bordered align-middle mb-0">
                    <thead className="table-light fs-8 text-uppercase text-muted">
                      <tr>
                        <th>Contribution Category</th>
                        <th>Specifics</th>
                        <th className="text-end">Quantity / Amount</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-semibold fs-7">
                          {selectedReceipt.type === 'GOODS' ? 'Goods & Relief Supplies' : 'Financial Aid Contribution'}
                        </td>
                        <td className="fs-7">
                          {selectedReceipt.type === 'GOODS' ? (
                            <div>
                              <strong>{selectedReceipt.itemName}</strong>
                              <div className="fs-8 text-muted">Relief Warehouse Stock</div>
                            </div>
                          ) : (
                            <div>
                              <strong>Emergency Relief Fund</strong>
                              <div className="fs-8 text-muted font-monospace">Ref: {selectedReceipt.transactionRef}</div>
                            </div>
                          )}
                        </td>
                        <td className="text-end fw-bold fs-6">
                          {selectedReceipt.type === 'GOODS' ? (
                            `${selectedReceipt.quantity} units`
                          ) : (
                            <span className="text-success">₹{selectedReceipt.amount?.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="text-center">
                          <span className={`badge ${selectedReceipt.status === 'VERIFIED' || selectedReceipt.status === 'APPROVED' ? 'bg-success' : 'bg-warning text-dark'} px-2 py-1`}>
                            {selectedReceipt.status}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Official Electronic Verification Acknowledgment */}
                <div className="p-3 bg-light rounded-3 border mb-4 text-center">
                  <p className="fs-8 text-muted mb-0">
                    <i className="bi bi-patch-check-fill text-primary me-1"></i>
                    This document serves as an official electronic acknowledgment issued by the Emergency Resource & Disaster Relief Dispatch Network. Thank you for your vital contribution towards humanitarian aid.
                  </p>
                </div>

                {/* Authorized Signature Block */}
                <div className="d-flex justify-content-between align-items-end pt-3 border-top">
                  <div className="fs-8 text-muted">
                    <div>Authority: <strong>Relief Dispatch Operations Network</strong></div>
                    <div>Verification: <strong>Digital System Certified</strong></div>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold text-dark fs-7 border-bottom pb-1" style={{ minWidth: '150px' }}>
                      Pradnyil Patil
                    </div>
                    <span className="fs-8 text-muted">Operations Coordinator</span>
                  </div>
                </div>
              </div>

              {/* Screen Modal Footer - Hidden in Print */}
              <div className="modal-footer bg-light py-2 px-4 no-print">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-3 rounded-pill"
                  onClick={() => setSelectedReceipt(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm px-4 rounded-pill fw-bold hover-lift"
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