import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { userApi } from '../../api/userApi';
import { useNotification } from '../../context/NotificationContext';

export function UserModal({ user, onClose, onSuccess }) {
  const { notify } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = !!user;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'VOLUNTEER',
      zone: '',
      isActive: true,
    }
  });

  const selectedRole = watch('role') || 'VOLUNTEER';
  const watchedName = watch('name') || '';

  const getRoleIconAndTheme = (role) => {
    switch (role) {
      case 'ADMINISTRATOR':
        return { icon: 'bi-shield-lock-fill', color: 'bg-danger', text: 'Administrator Account', border: 'border-danger' };
      case 'VOLUNTEER':
        return { icon: 'bi-person-badge-fill', color: 'bg-primary', text: 'Volunteer Responder', border: 'border-primary' };
      case 'CITIZEN':
        return { icon: 'bi-people-fill', color: 'bg-info', text: 'Citizen Requester', border: 'border-info' };
      case 'DONOR':
        return { icon: 'bi-heart-fill', color: 'bg-success', text: 'Resource Donor', border: 'border-success' };
      default:
        return { icon: 'bi-person-fill', color: 'bg-secondary', text: 'System User', border: 'border-secondary' };
    }
  };

  const roleMeta = getRoleIconAndTheme(selectedRole);

  useEffect(() => {
    if (isEditing) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        zone: user.zone || '',
        isActive: user.isActive,
      });
    }
  }, [user, isEditing, reset]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await userApi.update(user.id, data);
        notify({ message: 'User updated successfully', severity: 'success' });
      } else {
        await userApi.create(data);
        notify({ message: 'User created successfully', severity: 'success' });
      }
      onSuccess();
    } catch (err) {
      notify({ message: err?.message || err?.response?.data?.message || 'Operation failed', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="w-100"
        style={{ maxWidth: '520px', zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden w-100">
          <div className="card-header bg-primary text-white py-3 px-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div
                className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '38px', height: '38px', minWidth: '38px' }}
              >
                <i className={`bi ${isEditing ? 'bi-person-gear' : 'bi-person-plus-fill'} fs-5`}></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0">
                  {isEditing ? 'Edit User Profile' : 'Register New User'}
                </h5>
                <span className="text-white-50 fs-8">Disaster Relief Operations Identity</span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white shadow-none"
              onClick={onClose}
            ></button>
          </div>

          <div className="card-body p-4 bg-white">
            {/* User Logo & Identity Preview Banner */}
            <div className="d-flex align-items-center gap-3 p-3 mb-4 rounded-3 bg-light border border-opacity-50">
              <div
                className={`${roleMeta.color} text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm position-relative`}
                style={{ width: '56px', height: '56px', minWidth: '56px' }}
              >
                <i className={`bi ${roleMeta.icon} fs-3`}></i>
                <span
                  className="position-absolute bottom-0 end-0 bg-white rounded-circle p-1 d-flex align-items-center justify-content-center shadow-xs"
                  style={{ width: '18px', height: '18px' }}
                >
                  <i className="bi bi-shield-fill-check text-primary fs-9"></i>
                </span>
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-dark fs-6 text-truncate" style={{ maxWidth: '240px' }}>
                    {watchedName || (isEditing ? user?.name : 'New Account')}
                  </span>
                  <span className={`badge ${roleMeta.color} bg-opacity-10 text-${roleMeta.color.replace('bg-', '')} border ${roleMeta.border} fs-8 px-2 py-0.5 rounded-pill`}>
                    {selectedRole}
                  </span>
                </div>
                <div className="text-muted fs-8 mt-0.5">
                  <i className="bi bi-info-circle me-1"></i>
                  {roleMeta.text}
                </div>
              </div>
            </div>

            <form id="userForm" onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    className={`form-control bg-light border-start-0 ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g. John Doe"
                    {...register('name', { required: 'Name is required' })}
                  />
                </div>
                {errors.name && <div className="text-danger fs-8 mt-1">{errors.name.message}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">
                  Email Address {isEditing ? '(Read only)' : <span className="text-danger">*</span>}
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className={`form-control bg-light border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="name@example.com"
                    disabled={isEditing}
                    {...register('email', { required: !isEditing ? 'Email is required' : false })}
                  />
                </div>
                {errors.email && <div className="text-danger fs-8 mt-1">{errors.email.message}</div>}
              </div>

              {!isEditing && (
                <div className="mb-3">
                  <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">
                    Initial Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-key"></i>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control bg-light border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Min. 6 characters"
                      {...register('password', { required: 'Password is required' })}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary bg-light border-start-0 text-muted"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                    </button>
                  </div>
                  {errors.password && <div className="text-danger fs-8 mt-1">{errors.password.message}</div>}
                </div>
              )}

              <div className="row g-2 mb-3">
                <div className="col-sm-6">
                  <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">Phone Number</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-telephone"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0"
                      placeholder="e.g. 9876543210"
                      {...register('phone')}
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">Assigned Zone</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-geo-alt"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0"
                      placeholder="e.g. North Zone"
                      {...register('zone')}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fs-7 text-uppercase fw-semibold text-muted mb-1">
                  System Role <span className="text-danger">*</span>
                </label>
                <select className="form-select form-select-sm bg-light" {...register('role')}>
                  <option value="VOLUNTEER">VOLUNTEER (Relief Dispatch)</option>
                  <option value="CITIZEN">CITIZEN (Emergency Requester)</option>
                  <option value="DONOR">DONOR (Resource Contributor)</option>
                  <option value="ADMINISTRATOR">ADMINISTRATOR (Full System Access)</option>
                </select>
              </div>

              {isEditing && (
                <div className="p-3 bg-light rounded-3 border mt-3">
                  <div className="form-check form-switch d-flex align-items-center justify-content-between p-0 m-0">
                    <div>
                      <label className="form-check-label fw-bold text-dark fs-7 d-block" htmlFor="activeSwitch">
                        Account Access Active
                      </label>
                      <span className="text-muted fs-8">When disabled, this user is blocked from logging in.</span>
                    </div>
                    <input
                      className="form-check-input ms-3 fs-5"
                      type="checkbox"
                      role="switch"
                      id="activeSwitch"
                      {...register('isActive')}
                    />
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="card-footer border-top bg-light py-2 px-4 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="userForm"
              className="btn btn-sm btn-primary rounded-pill px-4 shadow-sm fw-semibold hover-lift"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-1"></i> {isEditing ? 'Save Changes' : 'Create User'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
