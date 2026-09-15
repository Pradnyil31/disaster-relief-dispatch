import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../utils/validators';
import { useAuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ROLES } from '../../utils/constants';

const ROLE_ROUTES = {
  [ROLES.ADMINISTRATOR]: '/admin',
  [ROLES.VOLUNTEER]: '/volunteer',
  [ROLES.CITIZEN]: '/citizen',
  [ROLES.DONOR]: '/donor',
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const userData = await login(data);
      notify({ message: 'Login successful', severity: 'success' });
      navigate(ROLE_ROUTES[userData.role] || '/', { replace: true });
    } catch (err) {
      notify({ message: err.message || 'Login failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 animate-fade-in" style={{ background: 'linear-gradient(135deg, var(--er-gray-50) 0%, var(--er-blue-50) 100%)' }}>
      
      {/* Decorative background blob */}
      <div className="position-absolute rounded-circle bg-primary opacity-10 blur" style={{ width: '400px', height: '400px', top: '-100px', left: '-100px', filter: 'blur(60px)', zIndex: 0 }}></div>
      
      <div className="w-100 position-relative" style={{ maxWidth: '420px', zIndex: 1 }}>
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle shadow-sm mb-3" style={{ width: '48px', height: '48px' }}>
            <i className="bi bi-shield-check fs-4"></i>
          </Link>
          <h2 className="fw-bold text-dark mb-1">Welcome Back</h2>
          <p className="text-muted">Sign in to your account to continue</p>
        </div>

        <div className="card shadow-lg border-0 glass p-4 p-sm-5">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
              <div className="d-flex justify-content-between">
                <label htmlFor="password" className="form-label">Password</label>
                <a href="#" className="text-primary small fw-medium text-decoration-none">Forgot password?</a>
              </div>
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

            <button type="submit" className="btn btn-primary w-100 py-2 mb-3 shadow-sm hover-lift" disabled={loading}>
              {loading ? (
                <span className="d-flex justify-content-center align-items-center gap-2">
                  <span className="spinner-border spinner-border-sm" role="status" />
                  Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
            
            <div className="text-center">
              <p className="text-muted small mb-0">
                Don't have an account? <Link to="/register" className="text-primary fw-bold text-decoration-none ms-1">Create one</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}