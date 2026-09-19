import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import toast from 'react-hot-toast';

export function DonatePublicPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('GOODS'); // 'GOODS' or 'MONEY'
  const [submitting, setSubmitting] = useState(false);

  // Goods Pledge Form State
  const [goodsForm, setGoodsForm] = useState({
    donorName: user?.name || '',
    donorEmail: user?.email || '',
    donorPhone: '',
    itemName: '',
    category: 'WATER_AND_HYDRATION',
    quantity: '10',
    notes: '',
  });

  // Money Donation Form State
  const [moneyForm, setMoneyForm] = useState({
    donorName: user?.name || '',
    donorEmail: user?.email || '',
    donorPhone: '',
    amount: '1000',
  });

  // Success Modal / Receipt State
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [showPaymentGatewayModal, setShowPaymentGatewayModal] = useState(false);

  const handleGoodsSubmit = async (e) => {
    e.preventDefault();
    if (!goodsForm.donorName || !goodsForm.donorEmail || !goodsForm.itemName || !goodsForm.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const created = await donationApi.createPledge({
        type: 'GOODS',
        ...goodsForm,
        quantity: Number(goodsForm.quantity),
      });

      setSuccessReceipt(created);
      toast.success('Pledge submitted successfully! Coordinator will review & approve.');
    } catch {
      toast.error('Failed to submit pledge. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoneyPaymentTrigger = (e) => {
    e.preventDefault();
    if (!moneyForm.donorName || !moneyForm.donorEmail || !moneyForm.amount || Number(moneyForm.amount) <= 0) {
      toast.error('Please enter a valid donation amount and contact details');
      return;
    }
    setShowPaymentGatewayModal(true);
  };

  const handleConfirmSimulatedPayment = async () => {
    try {
      setSubmitting(true);
      const txRef = `PAY-${Math.floor(100000000 + Math.random() * 900000000)}`;
      const created = await donationApi.createPledge({
        type: 'MONEY',
        donorName: moneyForm.donorName,
        donorEmail: moneyForm.donorEmail,
        donorPhone: moneyForm.donorPhone,
        amount: Number(moneyForm.amount),
        currency: 'INR',
        transactionRef: txRef,
        status: 'VERIFIED',
      });

      setShowPaymentGatewayModal(false);
      setSuccessReceipt(created);
      toast.success('Payment completed & verified successfully! Thank you for your support.');
    } catch {
      toast.error('Failed to record financial donation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light animate-fade-in">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm glass">
        <div className="container max-w-6xl">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
            <i className="bi bi-shield-heart text-warning"></i>
            <span>Disaster Relief Coordinator</span>
          </Link>
          <div className="navbar-nav ms-auto align-items-center gap-2">
            {user ? (
              <Link
                to={user.role === 'DONOR' ? '/donor' : user.role === 'ADMINISTRATOR' ? '/admin' : '/citizen'}
                className="btn btn-outline-light btn-sm rounded-pill px-3"
              >
                <i className="bi bi-speedometer2 me-1"></i> My Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm rounded-pill px-3">Login</Link>
                <Link to="/register" className="btn btn-warning btn-sm rounded-pill px-3 text-dark fw-bold me-1">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="container max-w-4xl py-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center p-3 mb-2 rounded-circle bg-success bg-opacity-10 text-success" style={{ width: '64px', height: '64px' }}>
            <i className="bi bi-heart-fill fs-2"></i>
          </div>
          <h2 className="fw-bolder text-dark mb-1">Disaster Relief Support & Donations</h2>
          <p className="text-muted max-w-xl mx-auto">
            Pledge essential relief supplies or contribute financially to empower field operations and save lives during emergencies.
          </p>
        </div>

        {/* Receipt Success View */}
        {successReceipt ? (
          <div className="card border-0 shadow-lg rounded-3 overflow-hidden bg-white mb-5 animate-fade-in">
            <div className="bg-success text-white p-4 text-center">
              <i className="bi bi-check-circle-fill fs-1 d-block mb-2"></i>
              <h3 className="fw-bold mb-1">Thank You for Your Support!</h3>
              <p className="mb-0 opacity-90">Your contribution has been successfully registered.</p>
            </div>
            <div className="card-body p-4 max-w-xl mx-auto">
              <div className="border rounded-3 p-3 bg-light mb-4">
                <div className="d-flex justify-content-between border-bottom pb-2 mb-2 fs-7">
                  <span className="text-muted">Receipt Ref ID</span>
                  <span className="fw-bold text-primary">{successReceipt.id}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-2 mb-2 fs-7">
                  <span className="text-muted">Donor Name</span>
                  <span className="fw-semibold text-dark">{successReceipt.donorName}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-2 mb-2 fs-7">
                  <span className="text-muted">Contribution Type</span>
                  <span className="badge bg-success">{successReceipt.type === 'GOODS' ? 'Goods Pledge' : 'Financial Contribution'}</span>
                </div>
                {successReceipt.type === 'GOODS' ? (
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2 fs-7">
                    <span className="text-muted">Pledged Supplies</span>
                    <span className="fw-bold text-dark">{successReceipt.quantity} of {successReceipt.itemName} ({successReceipt.category})</span>
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2 fs-7">
                      <span className="text-muted">Amount Donated</span>
                      <span className="fw-bold text-success">₹{successReceipt.amount?.toLocaleString()}</span>
                    </div>
                    <div className="d-flex justify-content-between fs-7">
                      <span className="text-muted">Transaction Ref</span>
                      <span className="font-monospace text-dark">{successReceipt.transactionRef}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="d-flex justify-content-center gap-3">
                <button
                  type="button"
                  className="btn btn-outline-primary rounded-pill px-4"
                  onClick={() => setSuccessReceipt(null)}
                >
                  Make Another Contribution
                </button>
                {user ? (
                  <Link to="/donor/donations" className="btn btn-success rounded-pill px-4 fw-bold">
                    View My Donations
                  </Link>
                ) : (
                  <Link to="/register" className="btn btn-warning rounded-pill px-4 text-dark fw-bold">
                    Create Donor Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Main Donation Card */
          <div className="card border-0 shadow-sm rounded-3 bg-white mb-5">
            {/* Tab Selector */}
            <div className="card-header bg-white p-3 border-bottom">
              <ul className="nav nav-pills nav-fill">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link fw-bold ${activeTab === 'GOODS' ? 'active bg-primary' : 'text-muted'}`}
                    onClick={() => setActiveTab('GOODS')}
                  >
                    <i className="bi bi-box-seam me-2"></i>Pledge Relief Goods
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link fw-bold ${activeTab === 'MONEY' ? 'active bg-success' : 'text-muted'}`}
                    onClick={() => setActiveTab('MONEY')}
                  >
                    <i className="bi bi-currency-rupee me-2"></i>Monetary Donation
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body p-4">
              {/* GOODS PLEDGE FORM */}
              {activeTab === 'GOODS' && (
                <form onSubmit={handleGoodsSubmit}>
                  <h5 className="fw-bold text-dark mb-3">Pledge Physical Relief Supplies</h5>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold fs-7 text-dark">Donor Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your full name"
                        value={goodsForm.donorName}
                        onChange={(e) => setGoodsForm({ ...goodsForm, donorName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold fs-7 text-dark">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="your.email@example.com"
                        value={goodsForm.donorEmail}
                        onChange={(e) => setGoodsForm({ ...goodsForm, donorEmail: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold fs-7 text-dark">Item Name (Custom) *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Blankets, Rice"
                        value={goodsForm.itemName}
                        onChange={(e) => setGoodsForm({ ...goodsForm, itemName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold fs-7 text-dark">Category *</label>
                      <select
                        className="form-select"
                        value={goodsForm.category}
                        onChange={(e) => setGoodsForm({ ...goodsForm, category: e.target.value })}
                      >
                        <option value="WATER_AND_HYDRATION">Water & Hydration</option>
                        <option value="FOOD_AND_RATIONS">Food & Rations</option>
                        <option value="MEDICAL_SUPPLIES">Medical Supplies</option>
                        <option value="SHELTER_AND_BLANKETS">Shelter & Blankets</option>
                        <option value="CLOTHING">Clothing</option>
                        <option value="FUEL_AND_ENERGY">Fuel & Energy</option>
                        <option value="RESCUE_EQUIPMENT">Rescue Equipment</option>
                        <option value="COMMUNICATION_DEVICES">Communication Devices</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold fs-7 text-dark">Pledged Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        placeholder="10"
                        value={goodsForm.quantity}
                        onChange={(e) => setGoodsForm({ ...goodsForm, quantity: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold fs-7 text-dark">Pickup / Delivery Instructions</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Can drop off at Kurla warehouse or available for pickup between 10am-4pm."
                      value={goodsForm.notes}
                      onChange={(e) => setGoodsForm({ ...goodsForm, notes: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Confirm Goods Pledge'}
                    </button>
                  </div>
                </form>
              )}

              {/* MONETARY DONATION FORM */}
              {activeTab === 'MONEY' && (
                <form onSubmit={handleMoneyPaymentTrigger}>
                  <h5 className="fw-bold text-dark mb-3">Make a Financial Contribution</h5>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold fs-7 text-dark">Donor Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your full name"
                        value={moneyForm.donorName}
                        onChange={(e) => setMoneyForm({ ...moneyForm, donorName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold fs-7 text-dark">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="your.email@example.com"
                        value={moneyForm.donorEmail}
                        onChange={(e) => setMoneyForm({ ...moneyForm, donorEmail: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Amount Preset Selector */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold fs-7 text-dark d-block">Select Donation Amount (INR) *</label>
                    <div className="row g-2 mb-2">
                      {['500', '1000', '2500', '5000'].map((val) => (
                        <div key={val} className="col-3">
                          <button
                            type="button"
                            className={`btn w-100 fw-bold ${moneyForm.amount === val ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => setMoneyForm({ ...moneyForm, amount: val })}
                          >
                            ₹{val}
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="input-group">
                      <span className="input-group-text bg-light fw-bold">₹</span>
                      <input
                        type="number"
                        min="100"
                        className="form-control"
                        placeholder="Enter custom amount"
                        value={moneyForm.amount}
                        onChange={(e) => setMoneyForm({ ...moneyForm, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="alert alert-info border-0 rounded-3 fs-7 mb-4">
                    <i className="bi bi-shield-check me-2"></i>
                    All financial contributions go directly toward procuring emergency water, medical supplies, and food kits.
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-success rounded-pill px-5 fw-bold shadow-sm"
                      disabled={submitting}
                    >
                      Proceed to Secure Payment
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Payment Gateway Simulator Modal */}
      {showPaymentGatewayModal && (
        <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-dark text-white py-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-lock-fill text-success fs-4"></i>
                  <div>
                    <h6 className="modal-title fw-bold mb-0">Razorpay Test Gateway</h6>
                    <span className="fs-7 text-muted">Test Payment Simulation</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPaymentGatewayModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4 text-center">
                <div className="bg-light p-3 rounded-3 border mb-4">
                  <span className="text-muted fs-7 text-uppercase fw-semibold d-block">Amount to Pay</span>
                  <h2 className="fw-bolder text-success mb-0">₹{Number(moneyForm.amount).toLocaleString()}</h2>
                  <span className="fs-7 text-muted">Disaster Relief Operations Fund</span>
                </div>

                <div className="text-start mb-4 fs-7">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Donor Name:</span>
                    <strong className="text-dark">{moneyForm.donorName}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Email:</span>
                    <span className="text-dark">{moneyForm.donorEmail}</span>
                  </div>
                </div>

                <div className="alert alert-warning border-0 fs-7 py-2 text-start">
                  <i className="bi bi-info-circle me-1"></i> This is a test gateway simulation for evaluation. Clicking below will complete payment verification.
                </div>
              </div>

              <div className="modal-footer bg-light py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-3 rounded-pill"
                  onClick={() => setShowPaymentGatewayModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-sm px-4 rounded-pill fw-bold"
                  disabled={submitting}
                  onClick={handleConfirmSimulatedPayment}
                >
                  {submitting ? 'Processing...' : 'Simulate Payment Success'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}