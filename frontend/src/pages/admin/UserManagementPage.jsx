import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';
import { formatDate } from '../../utils/helpers';
import { UserModal } from '../../components/admin/UserModal';
import toast from 'react-hot-toast';

export function UserManagementPage() {
  const { user, logout } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll({ page: 0, size: 200 });
      setUsers(res.content || []);
    } catch {
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Quick Inline Status Toggle
  const handleToggleStatus = async (targetUser) => {
    try {
      setTogglingId(targetUser.id);
      const nextStatus = !targetUser.isActive;
      await userApi.update(targetUser.id, {
        name: targetUser.name,
        role: targetUser.role,
        phone: targetUser.phone,
        zone: targetUser.zone,
        isActive: nextStatus,
      });
      toast.success(`User ${targetUser.name} is now ${nextStatus ? 'ACTIVE' : 'DEACTIVATED'}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isActive: nextStatus } : u))
      );
    } catch {
      toast.error('Failed to update user status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (u) => {
    setEditingUser(u);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    fetchUsers();
  };

  // Metrics computation
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = total - active;
    const admins = users.filter((u) => u.role === 'ADMINISTRATOR').length;
    const volunteers = users.filter((u) => u.role === 'VOLUNTEER').length;
    const citizens = users.filter((u) => u.role === 'CITIZEN').length;
    const donors = users.filter((u) => u.role === 'DONOR').length;
    return { total, active, inactive, admins, volunteers, citizens, donors };
  }, [users]);

  // Filtered List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (statusFilter === 'ACTIVE' && !u.isActive) return false;
      if (statusFilter === 'INACTIVE' && u.isActive) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = u.name?.toLowerCase().includes(q);
        const matchesEmail = u.email?.toLowerCase().includes(q);
        const matchesPhone = u.phone?.toLowerCase().includes(q);
        const matchesZone = u.zone?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesZone) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchTerm]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMINISTRATOR':
        return (
          <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2.5 py-1">
            <i className="bi bi-shield-fill-check me-1"></i> Admin
          </span>
        );
      case 'VOLUNTEER':
        return (
          <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1">
            <i className="bi bi-lightning-charge-fill me-1"></i> Volunteer
          </span>
        );
      case 'CITIZEN':
        return (
          <span className="badge rounded-pill bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2.5 py-1">
            <i className="bi bi-person-fill me-1"></i> Citizen
          </span>
        );
      case 'DONOR':
        return (
          <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1">
            <i className="bi bi-heart-fill me-1"></i> Donor
          </span>
        );
      default:
        return <span className="badge bg-secondary rounded-pill px-2.5 py-1">{role}</span>;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (role) => {
    switch (role) {
      case 'ADMINISTRATOR': return 'bg-danger text-white';
      case 'VOLUNTEER': return 'bg-primary text-white';
      case 'DONOR': return 'bg-success text-white';
      default: return 'bg-info text-white';
    }
  };

  return (
    <div className="min-vh-100 bg-light animate-fade-in">
      {/* Top Navbar Matching Other Admin Pages */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm glass py-2">
        <div className="container max-w-6xl">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-6 fs-sm-5 mb-0" to="/admin">
            <i className="bi bi-shield-lock-fill text-warning"></i>
            <span>Admin Command Center</span>
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

      {/* Main Container */}
      <main className="container max-w-6xl py-4">
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2.5 py-1">
                Access & Security
              </span>
              <span className="text-muted fs-7">• Identity Management</span>
            </div>
            <h2 className="fw-bolder text-dark mb-1">User Directory & Roles</h2>
            <p className="text-muted mb-0">
              Provision accounts, assign organizational roles, and govern system-wide authentication access.
            </p>
          </div>
          <button 
            className="btn btn-primary rounded-pill px-4 shadow-sm hover-lift fw-bold d-flex align-items-center gap-2"
            onClick={handleAddUser}
          >
            <i className="bi bi-person-plus-fill"></i>
            Add New User
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-primary border-4 h-100 hover-lift transition-all">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Total Users</span>
                  <h2 className="fw-bold mb-0 text-primary">{loading ? '...' : stats.total}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                  <i className="bi bi-people-fill fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-success border-4 h-100 hover-lift transition-all">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Active Accounts</span>
                  <h2 className="fw-bold mb-0 text-success">{loading ? '...' : stats.active}</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                  <i className="bi bi-check-circle-fill fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-danger border-4 h-100 hover-lift transition-all">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Deactivated</span>
                  <h2 className="fw-bold mb-0 text-danger">{loading ? '...' : stats.inactive}</h2>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger">
                  <i className="bi bi-slash-circle-fill fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-info border-4 h-100 hover-lift transition-all">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted text-uppercase fw-semibold fs-7">Volunteers / Admins</span>
                  <h3 className="fw-bold mb-0 text-dark">
                    {loading ? '...' : `${stats.volunteers} / ${stats.admins}`}
                  </h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded-circle text-info">
                  <i className="bi bi-shield-lock-fill fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="card border-0 shadow-sm rounded-3 mb-4 p-3 bg-white">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-12 col-md-5">
              <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">Search Directory</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search by name, email, phone, or zone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="btn btn-light border-start-0" onClick={() => setSearchTerm('')}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Role Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">Filter by Role</label>
              <select
                className="form-select form-select-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles ({stats.total})</option>
                <option value="ADMINISTRATOR">Administrator ({stats.admins})</option>
                <option value="VOLUNTEER">Volunteer ({stats.volunteers})</option>
                <option value="CITIZEN">Citizen ({stats.citizens})</option>
                <option value="DONOR">Donor ({stats.donors})</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-12 col-sm-6 col-md-4">
              <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">Filter by Status</label>
              <div className="btn-group btn-group-sm w-100" role="group">
                <button
                  type="button"
                  className={`btn ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setStatusFilter('ALL')}
                >
                  All ({stats.total})
                </button>
                <button
                  type="button"
                  className={`btn ${statusFilter === 'ACTIVE' ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                  onClick={() => setStatusFilter('ACTIVE')}
                >
                  Active ({stats.active})
                </button>
                <button
                  type="button"
                  className={`btn ${statusFilter === 'INACTIVE' ? 'btn-danger text-white' : 'btn-outline-secondary'}`}
                  onClick={() => setStatusFilter('INACTIVE')}
                >
                  Inactive ({stats.inactive})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Table Card */}
        <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
          <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <h5 className="fw-bold mb-0 text-dark">Registered Accounts</h5>
              <span className="badge bg-secondary rounded-pill">{filteredUsers.length}</span>
            </div>
            {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL' ? (
              <button
                className="btn btn-sm btn-link text-decoration-none text-muted p-0 fs-7"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('ALL');
                  setStatusFilter('ALL');
                }}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>Reset filters
              </button>
            ) : null}
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 px-4 text-muted fs-7 text-uppercase fw-semibold border-bottom">User & Identity</th>
                    <th className="py-3 text-muted fs-7 text-uppercase fw-semibold border-bottom">System Role</th>
                    <th className="py-3 text-muted fs-7 text-uppercase fw-semibold border-bottom">Contact / Zone</th>
                    <th className="py-3 text-muted fs-7 text-uppercase fw-semibold border-bottom">Account Status</th>
                    <th className="py-3 text-muted fs-7 text-uppercase fw-semibold border-bottom">Registered On</th>
                    <th className="py-3 px-4 text-end text-muted fs-7 text-uppercase fw-semibold border-bottom">Management</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading users...</span>
                        </div>
                        <p className="text-muted mt-2 mb-0 fs-7">Fetching system directory...</p>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div className="bg-light p-4 rounded-circle d-inline-flex mb-3 text-muted">
                          <i className="bi bi-person-x fs-1"></i>
                        </div>
                        <h6 className="fw-bold text-dark">No Matching Users Found</h6>
                        <p className="text-muted fs-7 mb-0">Try adjusting your search criteria or role filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} style={{ transition: 'background-color 0.15s ease' }}>
                        {/* User Identity Column */}
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div 
                              className={`rounded-circle d-flex align-items-center justify-content-center fw-bold fs-7 shadow-sm ${getAvatarBg(u.role)}`}
                              style={{ width: '40px', height: '40px', minWidth: '40px' }}
                            >
                              {getInitials(u.name)}
                            </div>
                            <div>
                              <div className="fw-bold text-dark d-flex align-items-center gap-2">
                                <span>{u.name}</span>
                                {u.email === user?.email && (
                                  <span className="badge bg-warning text-dark fs-8 rounded-pill px-2">You</span>
                                )}
                              </div>
                              <div className="text-muted fs-7">
                                <i className="bi bi-envelope me-1"></i>
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* System Role */}
                        <td className="py-3">
                          {getRoleBadge(u.role)}
                          {u.volunteerStatus && (
                            <div className="mt-1">
                              <span className="badge bg-light text-muted border fs-8">
                                <i className="bi bi-activity me-1"></i>{u.volunteerStatus}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Phone / Zone */}
                        <td className="py-3">
                          <div className="text-dark fs-7 fw-medium">
                            <i className="bi bi-telephone me-1 text-muted"></i>
                            {u.phone || <span className="text-muted">—</span>}
                          </div>
                          <div className="text-muted fs-8">
                            <i className="bi bi-geo-alt me-1 text-muted"></i>
                            {u.zone || 'General Zone'}
                          </div>
                        </td>

                        {/* Status Switch Column */}
                        <td className="py-3">
                          <div className="d-inline-flex align-items-center gap-2">
                            <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
                              <input
                                className="form-check-input ms-0 me-2"
                                type="checkbox"
                                role="switch"
                                id={`switch-${u.id}`}
                                checked={!!u.isActive}
                                disabled={togglingId === u.id || u.email === user?.email}
                                onChange={() => handleToggleStatus(u)}
                                title={u.email === user?.email ? "Cannot deactivate yourself" : "Toggle active access"}
                                style={{ cursor: u.email === user?.email ? 'not-allowed' : 'pointer' }}
                              />
                            </div>
                            {u.isActive ? (
                              <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1">
                                <i className="bi bi-check-circle-fill me-1"></i> Active
                              </span>
                            ) : (
                              <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2.5 py-1">
                                <i className="bi bi-slash-circle-fill me-1"></i> Inactive
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Registered Date */}
                        <td className="py-3 text-muted fs-7">
                          {u.createdAt ? formatDate(u.createdAt) : '—'}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-end">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill px-3 hover-lift shadow-xs"
                            onClick={() => handleEditUser(u)}
                          >
                            <i className="bi bi-pencil-square me-1"></i> Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
