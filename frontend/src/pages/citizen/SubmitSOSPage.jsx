import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sosSchema } from '../../utils/validators';
import { sosApi } from '../../api/sosApi';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useAuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { URGENCY_LEVELS } from '../../utils/constants';

const SUPPLY_CATEGORIES = [
  { value: 'water', label: 'Water & Hydration' },
  { value: 'food', label: 'Food & Rations' },
  { value: 'medical', label: 'Medical Supplies' },
  { value: 'shelter', label: 'Shelter & Blankets' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'fuel', label: 'Fuel & Energy' },
  { value: 'rescue', label: 'Rescue Equipment' },
  { value: 'communication', label: 'Communication Devices' },
];

const URGENCY_CONFIG = {
  High:   { color: 'danger',  icon: 'bi-exclamation-triangle-fill', desc: 'Life-threatening situation' },
  Medium: { color: 'warning', icon: 'bi-exclamation-circle-fill',   desc: 'Serious but not immediately fatal' },
  Low:    { color: 'info',    icon: 'bi-info-circle-fill',          desc: 'Assistance needed, stable for now' },
};

export function SubmitSOSPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const { notify } = useNotification();
  const { coordinates, error: geoError, loading: geoLoading, accuracyWarning, getCurrentPosition, clearLocation } = useGeolocation();
  const [submitting, setSubmitting] = useState(false);
  const [selectedSupplies, setSelectedSupplies] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sosSchema),
    defaultValues: {
      urgencyLevel: '',
      requiredSupplies: [],
      latitude: undefined,
      longitude: undefined,
    },
  });

  const selectedUrgency = watch('urgencyLevel');

  const handleGetLocation = async () => {
    try {
      const coords = await getCurrentPosition();
      setValue('latitude', coords.latitude, { shouldValidate: true });
      setValue('longitude', coords.longitude, { shouldValidate: true });
      notify({ message: 'Location captured successfully', severity: 'success' });
    } catch {
      notify({ message: geoError || 'Could not get location. Please enable GPS.', severity: 'error' });
    }
  };

  const handleSupplyToggle = (value) => {
    const updated = selectedSupplies.includes(value)
      ? selectedSupplies.filter((s) => s !== value)
      : [...selectedSupplies, value];
    setSelectedSupplies(updated);
    setValue('requiredSupplies', updated, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await sosApi.create(data);
      notify({ message: 'SOS request submitted successfully. Help is on the way!', severity: 'success' });
      navigate('/citizen/sos/history');
    } catch (err) {
      notify({ message: err?.response?.data?.message || 'Failed to submit SOS. Please try again.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light animate-fade-in">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/citizen">
            <i className="bi bi-shield-check"></i>
            Citizen Portal
          </Link>
          <div className="navbar-nav ms-auto align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 text-white bg-white bg-opacity-10 px-3 py-1 rounded-pill">
              <i className="bi bi-person-circle"></i>
              <span className="fw-medium">{user?.name}</span>
            </div>
            <button type="button" className="btn btn-outline-light btn-sm px-3 rounded-pill" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container py-4 py-lg-5" style={{ maxWidth: '760px' }}>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/citizen" className="text-decoration-none">Dashboard</Link></li>
            <li className="breadcrumb-item active">Submit SOS Request</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '56px', height: '56px' }}>
            <i className="bi bi-broadcast fs-3"></i>
          </div>
          <div>
            <h1 className="fw-bolder text-dark mb-1 fs-3">Submit SOS Request</h1>
            <p className="text-muted mb-0 small">Complete all sections below. Your GPS location is required.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* STEP 1: Geolocation */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <span className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold" style={{ width: '24px', height: '24px', fontSize: '0.72rem' }}>1</span>
                Your Location
                <span className="text-danger ms-1">*</span>
              </h5>
            </div>
            <div className="card-body">
              {coordinates ? (
                <div>
                  <div className="alert alert-success d-flex align-items-start gap-3 mb-0" role="alert">
                    <i className="bi bi-geo-alt-fill fs-5 flex-shrink-0 mt-1"></i>
                    <div className="flex-grow-1">
                      <strong>Location Captured</strong>
                      <div className="mt-1 small font-monospace">
                        <span>Lat: {coordinates.latitude.toFixed(6)}</span>
                        <span className="mx-2">|</span>
                        <span>Lng: {coordinates.longitude.toFixed(6)}</span>
                      </div>
                      {coordinates.accuracy && (
                        <div className="text-muted small mt-1">
                          Accuracy: ±{Math.round(coordinates.accuracy).toLocaleString()}m
                        </div>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success mt-2"
                        onClick={handleGetLocation}
                        disabled={geoLoading}
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Refresh Location
                      </button>
                    </div>
                  </div>
                  {accuracyWarning && (
                    <div className="alert alert-warning d-flex align-items-start gap-2 mt-3 mb-0" role="alert">
                      <i className="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1"></i>
                      <div>
                        <strong>Poor GPS accuracy (±{Math.round(coordinates.accuracy / 1000)}km)</strong>
                        <p className="mb-1 small mt-1">
                          Your browser is using IP-based location, which is too imprecise for emergency dispatch.
                          To improve accuracy:
                        </p>
                        <ul className="mb-2 small">
                          <li>Enable <strong>Wi-Fi</strong> on your device (even without connecting to a network).</li>
                          <li>Enable <strong>device GPS / Location Services</strong> in system settings.</li>
                          <li>Move closer to a window or go outdoors, then click <strong>Refresh Location</strong>.</li>
                        </ul>
                        <button
                          type="button"
                          className="btn btn-sm btn-warning"
                          onClick={handleGetLocation}
                          disabled={geoLoading}
                        >
                          {geoLoading ? (
                            <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Retrying…</>
                          ) : (
                            <><i className="bi bi-arrow-clockwise me-1"></i>Retry for better accuracy</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {geoError && (
                    <div className="alert alert-warning small mb-3" role="alert">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {geoError}
                    </div>
                  )}
                  <p className="text-muted small mb-3">
                    Click the button below to capture your current GPS coordinates. Your browser will ask for location permission.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary hover-lift"
                    onClick={handleGetLocation}
                    disabled={geoLoading}
                    aria-label="Get current GPS location"
                  >
                    {geoLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Fetching Location…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-geo-alt-fill me-2"></i>
                        Get My Location
                      </>
                    )}
                  </button>
                </div>
              )}
              {/* Hidden inputs registered to RHF */}
              <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
              <input type="hidden" {...register('longitude', { valueAsNumber: true })} />
              {(errors.latitude || errors.longitude) && (
                <div className="text-danger small mt-2">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  Location is required. Please click "Get My Location".
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: Urgency Level */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <span className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold" style={{ width: '24px', height: '24px', fontSize: '0.72rem' }}>2</span>
                Urgency Level
                <span className="text-danger ms-1">*</span>
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3" role="radiogroup" aria-label="Select urgency level">
                {URGENCY_LEVELS.map((level) => {
                  const cfg = URGENCY_CONFIG[level];
                  const isSelected = selectedUrgency === level;
                  return (
                    <div className="col-12 col-sm-4 d-flex" key={level}>
                      <label
                        htmlFor={`urgency-${level}`}
                        className={`d-flex align-items-center gap-3 p-3 rounded-3 w-100 ${
                          isSelected
                            ? `border border-${cfg.color} bg-${cfg.color} bg-opacity-10`
                            : 'border border-light-subtle bg-white'
                        }`}
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease', minHeight: '80px' }}
                      >
                        <input
                          type="radio"
                          id={`urgency-${level}`}
                          value={level}
                          className="visually-hidden"
                          {...register('urgencyLevel')}
                        />
                        <i className={`bi ${cfg.icon} fs-3 flex-shrink-0 text-${cfg.color}`}></i>
                        <div>
                          <div className={`fw-semibold text-${cfg.color}`}>{level}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{cfg.desc}</div>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
              {errors.urgencyLevel && (
                <div className="text-danger small mt-2">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.urgencyLevel.message}
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: Required Supplies */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <span className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold" style={{ width: '24px', height: '24px', fontSize: '0.72rem' }}>3</span>
                Required Supplies
                <span className="text-danger ms-1">*</span>
                {selectedSupplies.length > 0 && (
                  <span className="badge bg-primary ms-2">{selectedSupplies.length} selected</span>
                )}
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted small mb-3">Select all categories of supplies you need. You must select at least one.</p>
              <div className="row g-2" role="group" aria-label="Select required supplies">
                {SUPPLY_CATEGORIES.map(({ value, label }) => {
                  const isChecked = selectedSupplies.includes(value);
                  return (
                    <div className="col-6 col-md-3" key={value}>
                      <label
                        htmlFor={`supply-${value}`}
                        className={`d-flex flex-column align-items-center justify-content-center text-center p-3 rounded-3 border-2 h-100 ${
                          isChecked
                            ? 'border-primary bg-primary bg-opacity-10 text-primary'
                            : 'border border-light-subtle bg-white text-muted'
                        }`}
                        style={{ cursor: 'pointer', minHeight: '80px', transition: 'all 0.2s ease' }}
                      >
                        <input
                          type="checkbox"
                          id={`supply-${value}`}
                          className="visually-hidden"
                          checked={isChecked}
                          onChange={() => handleSupplyToggle(value)}
                        />
                        <i className={`bi bi-box-seam fs-5 mb-1 ${isChecked ? 'text-primary' : ''}`}></i>
                        <span className="fw-medium" style={{ fontSize: '0.8rem' }}>{label}</span>
                        {isChecked && <i className="bi bi-check-circle-fill text-primary mt-1" style={{ fontSize: '0.75rem' }}></i>}
                      </label>
                    </div>
                  );
                })}
              </div>
              {errors.requiredSupplies && (
                <div className="text-danger small mt-2">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.requiredSupplies.message}
                </div>
              )}
            </div>
          </div>

          {/* STEP 4: Additional Notes (optional) */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <span className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold" style={{ width: '24px', height: '24px', fontSize: '0.72rem' }}>4</span>
                Additional Notes
                <span className="text-muted fw-normal ms-1 small">(Optional)</span>
              </h5>
            </div>
            <div className="card-body">
              <textarea
                id="notes"
                className="form-control"
                rows="3"
                placeholder="Describe your situation, number of people affected, any hazards nearby…"
                {...register('notes')}
              ></textarea>
            </div>
          </div>

          {/* Submit */}
          <div className="d-flex flex-column flex-sm-row gap-3">
            <button
              type="submit"
              className="btn btn-danger btn-lg px-5 hover-lift flex-grow-1"
              disabled={submitting}
              aria-live="polite"
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting…
                </>
              ) : (
                <>
                  <i className="bi bi-broadcast-pin me-2"></i>
                  Send SOS Request
                </>
              )}
            </button>
            <Link to="/citizen" className="btn btn-outline-secondary btn-lg px-4">
              Cancel
            </Link>
          </div>

        </form>
      </main>
    </div>
  );
}