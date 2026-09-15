import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../utils/validators';
import { useAuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthContext();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data);
      notify({ message: 'Registration successful. Please login.', severity: 'success' });
      navigate('/login', { replace: true });
    } catch (err) {
      notify({ message: err.message || 'Registration failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 animate-fade-in" style={{ background: 'linear-gradient(135deg, var(--er-gray-50) 0%, var(--er-blue-50) 100%)' }}>
      
      {/* Decorative background blob */}
      <div className="position-absolute rounded-circle bg-success opacity-10 blur" style={{ width: '500px', height: '500px', bottom: '-150px', right: '-150px', filter: 'blur(80px)', zIndex: 0 }}></div>
      
      <div className="w-100 position-relative" style={{ maxWidth: '480px', zIndex: 1 }}>
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle shadow-sm mb-3" style={{ width: '48px', height: '48px' }}>
            <i className="bi bi-shield-check fs-4"></i>
          </Link>
          <h2 className="fw-bold text-dark mb-1">Create Account</h2>
          <p className="text-muted">Join the relief network to request help or volunteer</p>
        </div>

        <div className="card shadow-lg border-0 glass p-4 p-sm-5">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            
            <div className="mb-4">
              <label htmlFor="name" className="form-label">Full Name</label>
              <div className="position-relative">
                <i className="bi bi-person position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                <input
                  type="text"
                  id="name"
                  className={`form-control ps-5 py-2 ${errors.name ? 'is-invalid' : ''}`}
                  {...register('name')}
                  placeholder="Jane Doe"
                  disabled={loading}
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="position-relative">
                <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                <input
                  type="email"
                  id="email"
                  className={`form-control ps-5 py-2 ${errors.email ? 'is-invalid' : ''}`}
                  {...register('email')}
                  placeholder="you@example.com"
                  disabled={loading}
                />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="position-relative">
                <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                <input
                  type="password"
                  id="password"
                  className={`form-control ps-5 py-2 ${errors.password ? 'is-invalid' : ''}`}
                  {...register('password')}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="role" className="form-label">I want to register as a...</label>
              <div className="position-relative">
                <i className="bi bi-briefcase position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ zIndex: 4 }}></i>
                <select
                  id="role"
                  className={`form-select ps-5 py-2 ${errors.role ? 'is-invalid' : ''}`}
                  {...register('role')}
                  disabled={loading}
                >
                  <option value="">Select your role</option>
                  <option value="CITIZEN">Citizen (Request Help)</option>
                  <option value="VOLUNTEER">Volunteer (Deliver Aid)</option>
                  <option value="DONOR">Donor (Contribute)</option>
                </select>
                {errors.role && <div className="invalid-feedback">{errors.role.message}</div>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 mb-3 shadow-sm hover-lift" disabled={loading}>
              {loading ? (
                <span className="d-flex justify-content-center align-items-center gap-2">
                  <span className="spinner-border spinner-border-sm" role="status" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
            
            <div className="text-center">
              <p className="text-muted small mb-0">
                Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none ms-1">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}