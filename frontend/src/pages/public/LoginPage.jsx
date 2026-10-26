import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../utils/validators';
import { useAuthContext } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import toast from 'react-hot-toast';

const ROLE_ROUTES = {
  [ROLES.ADMINISTRATOR]: '/admin',
  [ROLES.VOLUNTEER]: '/volunteer',
  [ROLES.CITIZEN]: '/citizen',
  [ROLES.DONOR]: '/donor',
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setLoginError('');
    try {
      const userData = await login(data);
      toast.success('Login successful! Welcome back.');
      navigate(ROLE_ROUTES[userData.role] || '/', { replace: true });
    } catch (err) {
      const errMsg = err?.message || 'Login failed. Please check your credentials.';
      setLoginError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 px-3 position-relative overflow-hidden animate-fade-in" style={{ background: 'linear-gradient(135deg, var(--er-gray-50) 0%, var(--er-blue-50) 100%)' }}>
      
      {/* Top Mobile-Friendly Navigation Header */}
      <div className="position-absolute top-0 start-0 w-100 p-3 p-sm-4 d-flex justify-content-between align-items-center" style={{ zIndex: 10 }}>
        <Link to="/" className="text-decoration-none text-dark d-flex align-items-center gap-2 fw-semibold fs-7 hover-lift bg-white bg-opacity-75 rounded-pill px-3 py-2 shadow-sm border border-light">
          <i className="bi bi-arrow-left text-primary fs-6"></i>
          <span>Home</span>
        </Link>
        <span className="badge bg-white text-primary shadow-sm border border-light rounded-pill px-3 py-2 fs-7 d-flex align-items-center gap-1">
          <i className="bi bi-shield-lock-fill text-primary"></i>
          <span>Relief Network</span>
        </span>
      </div>

      {/* Decorative background blob */}
      <div className="position-absolute rounded-circle bg-primary opacity-10 blur" style={{ width: '350px', height: '350px', top: '-100px', left: '-100px', filter: 'blur(60px)', zIndex: 0 }}></div>
      <div className="position-absolute rounded-circle bg-success opacity-10 blur" style={{ width: '350px', height: '350px', bottom: '-100px', right: '-100px', filter: 'blur(60px)', zIndex: 0 }}></div>
      
      <div className="w-100 position-relative mt-4 mt-sm-0" style={{ maxWidth: '440px', zIndex: 1 }}>
        <div className="text-center mb-3 mb-sm-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle shadow mb-2 mb-sm-3" style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
            <i className="bi bi-shield-check fs-3"></i>
          </div>
          <h2 className="fw-bold text-dark mb-1 fs-3 fs-sm-2">Welcome Back</h2>
          <p className="text-muted fs-7 fs-sm-6 mb-0">Sign in to your account to continue</p>
        </div>

        <div className="card shadow-lg border-0 glass p-3 p-sm-5 rounded-4">
          {/* Segmented Auth Toggle Switch for Mobile & Desktop */}
          <div className="bg-light p-1 rounded-pill d-flex mb-4 border shadow-xs">
            <button type="button" className="btn btn-sm w-50 rounded-pill bg-primary text-white fw-bold shadow-sm py-2" disabled>
              Sign In
            </button>
            <Link to="/register" className="btn btn-sm w-50 rounded-pill text-muted fw-semibold py-2">
              Register
            </Link>
          </div>

          {/* Inline Error Alert */}
          {loginError && (
            <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3 py-2.5 px-3 fs-7 mb-3 border-danger border-opacity-25 animate-fade-in" role="alert">
              <i className="bi bi-exclamation-octagon-fill text-danger fs-6 flex-shrink-0"></i>
              <div>{loginError}</div>
            </div>
          )}

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
              <label htmlFor="password" className="form-label">Password</label>
              <div className="position-relative">
                <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`form-control ps-5 pe-5 py-2 ${errors.password ? 'is-invalid' : ''}`}
                  {...register('password')}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted text-decoration-none pe-3 border-0 bg-transparent shadow-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                </button>
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