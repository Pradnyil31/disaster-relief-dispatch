import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { sosApi } from '../../api/sosApi';
import { volunteerApi } from '../../api/volunteerApi';
import { dispatchApi } from '../../api/dispatchApi';
import { formatDate, getUrgencyBadgeClass, getDispatchStatusBadgeClass } from '../../utils/helpers';
import toast from 'react-hot-toast';

export function DispatchManagementPage() {
  const { user, logout } = useAuthContext();
  const location = useLocation();

  const [pendingSosList, setPendingSosList] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedSosId, setSelectedSosId] = useState(location.state?.selectedSosId || '');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sosRes, volRes, dspRes] = await Promise.all([
        sosApi.list({ status: 'PENDING' }),
        volunteerApi.list({ status: 'ALL' }),
        dispatchApi.list({ status: 'ALL' }),
      ]);

      const pendingSos = sosRes.content || (Array.isArray(sosRes) ? sosRes : []);
      const volunteerList = volRes.content || (Array.isArray(volRes) ? volRes : []);
      const dispatchList = dspRes.content || (Array.isArray(dspRes) ? dspRes : []);

      setPendingSosList(pendingSos);
      setVolunteers(volunteerList);
      setDispatches(dispatchList);

      // Pre-select first SOS if available and none selected
      if (!selectedSosId && pendingSos.length > 0) {
        setSelectedSosId(pendingSos[0].id);
      }
    } catch {
      toast.error('Failed to load dispatch options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSosId || !selectedVolunteerId) {
      toast.error('Please select both an SOS request and a volunteer');
      return;
    }

    const sosObj = pendingSosList.find(s => s.id === selectedSosId);
    const volObj = volunteers.find(v => v.id === selectedVolunteerId);

    try {
      setAssigning(true);
      await dispatchApi.assign({
        sosId: selectedSosId,
        volunteerId: selectedVolunteerId,
        citizenName: sosObj?.citizenName || 'Citizen',
        citizenPhone: sosObj?.citizenPhone || '',
        latitude: sosObj?.latitude,
        longitude: sosObj?.longitude,
        urgencyLevel: sosObj?.urgencyLevel || 'Medium',
        requiredSupplies: sosObj?.requiredSupplies || [],
        notes: dispatchNotes || sosObj?.notes || '',
      });

      // Update volunteer status to BUSY
      if (volObj) {
        await volunteerApi.updateStatus(volObj.id, 'BUSY');
      }

      toast.success(`Volunteer ${volObj?.name || ''} successfully assigned to ${selectedSosId}!`);
      setSelectedSosId('');
      setSelectedVolunteerId('');
      setDispatchNotes('');
      await fetchData();
    } catch {
      toast.error('Failed to assign dispatch task');
    } finally {
      setAssigning(false);
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
          <div className="navbar-nav ms-auto align-items-center gap-2">
            <Link to="/admin" className="btn btn-outline-light btn-sm rounded-pill px-3 me-2">
              <i className="bi bi-speedometer2 me-1"></i> Dashboard
            </Link>
            <div className="d-flex align-items-center gap-2 text-white bg-white bg-opacity-10 px-3 py-1 rounded-pill">
              <i className="bi bi-person-badge"></i>
              <span className="fw-medium">{user?.name || 'Admin'}</span>
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
            <h2 className="fw-bolder text-dark mb-1">Manual Dispatch Assignment (FR-4.1)</h2>
            <p className="text-muted mb-0">Manually link pending emergency distress signals to available field volunteers.</p>
          </div>
        </div>

        {/* Dispatch Assignment Card Form */}
        <div className="card border-0 shadow-sm rounded-3 mb-4 p-4 bg-white border-top border-warning border-4">
          <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-truck text-warning"></i> Assign Volunteer to Emergency SOS
          </h5>

          <form onSubmit={handleAssignSubmit}>
            <div className="row g-3 mb-3">
              {/* Select SOS Request */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-dark fs-7">Select Pending SOS Request *</label>
                <select
                  className="form-select"
                  value={selectedSosId}
                  onChange={(e) => setSelectedSosId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Pending SOS Alert --</option>
                  {pendingSosList.map((sos) => (
                    <option key={sos.id} value={sos.id}>
                      [{sos.id}] {sos.citizenName} ({sos.urgencyLevel} Urgency - {sos.requiredSupplies?.join(', ')})
                    </option>
                  ))}
                </select>
                {pendingSosList.length === 0 && (
                  <span className="fs-7 text-success mt-1 d-block">
                    <i className="bi bi-check-circle me-1"></i> No pending unassigned SOS requests!
                  </span>
                )}
              </div>

              {/* Select Volunteer */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-dark fs-7">Select Field Volunteer *</label>
                <select
                  className="form-select"
                  value={selectedVolunteerId}
                  onChange={(e) => setSelectedVolunteerId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Volunteer --</option>
                  {volunteers.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.zone} - Status: {v.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Dispatch Notes */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark fs-7">Special Instructions / Dispatch Note</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Priority dispatch for elderly assistance. Pick up 20L water from Kurla hub."
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-warning rounded-pill px-4 text-dark fw-bold hover-lift"
                disabled={assigning || pendingSosList.length === 0}
              >
                {assigning ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span> Assigning...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-check me-2"></i> Confirm & Dispatch Volunteer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Dispatches Table */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">Active Dispatch Missions ({dispatches.length})</h5>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2 mb-0">Loading dispatches...</p>
              </div>
            ) : dispatches.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted d-block mb-2 opacity-50"></i>
                <h5 className="fw-bold text-dark mb-1">No Dispatches Created</h5>
                <p className="text-muted mb-0">Use the form above to assign pending SOS alerts to volunteers.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light fs-7 text-uppercase text-muted">
                    <tr>
                      <th className="ps-4">Dispatch ID</th>
                      <th>SOS Ref ID</th>
                      <th>Citizen Name</th>
                      <th>Urgency</th>
                      <th>Dispatch Status</th>
                      <th>Assigned Date</th>
                      <th className="pe-4 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatches.map((d) => (
                      <tr key={d.id}>
                        <td className="ps-4 fw-bold text-primary">{d.id}</td>
                        <td className="fw-semibold text-dark">{d.sosId}</td>
                        <td>
                          <div className="fw-medium text-dark">{d.citizenName}</div>
                          <div className="fs-7 text-muted">{d.citizenPhone}</div>
                        </td>
                        <td>
                          <span className={`badge ${getUrgencyBadgeClass(d.urgencyLevel)} px-2 py-1`}>
                            {d.urgencyLevel}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getDispatchStatusBadgeClass(d.status)} px-2 py-1`}>
                            {d.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="fs-7 text-muted">{formatDate(d.assignedAt)}</td>
                        <td className="pe-4 text-end">
                          <Link to={`/volunteer/tasks/${d.id}`} className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                            <i className="bi bi-eye me-1"></i> View Details
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