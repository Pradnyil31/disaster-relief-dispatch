import { useState, useCallback } from 'react';

// Accuracy worse than this (in metres) means the browser fell back to IP geolocation.
// IP geolocation is typically 1,000–100,000 m — not useful for field dispatch.
const ACCURACY_WARN_THRESHOLD = 5000;

export function useGeolocation() {
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accuracyWarning, setAccuracyWarning] = useState(false);

  const getCurrentPosition = useCallback((opts = {}) => {
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser';
      setError(msg);
      return Promise.reject(new Error(msg));
    }

    setLoading(true);
    setError(null);
    setAccuracyWarning(false);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setCoordinates(coords);
          setLoading(false);

          // Warn if accuracy is too poor to be useful (IP-based fallback)
          if (coords.accuracy > ACCURACY_WARN_THRESHOLD) {
            setAccuracyWarning(true);
          }

          resolve(coords);
        },
        (err) => {
          let message = 'Unable to retrieve location';
          if (err.code === err.PERMISSION_DENIED) {
            message = 'Location permission denied. Please allow location access in your browser settings.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            message = 'Location unavailable. Ensure GPS / Wi-Fi is enabled on your device.';
          } else if (err.code === err.TIMEOUT) {
            message = 'Location request timed out. Try moving to an open area or enabling Wi-Fi.';
          }
          setError(message);
          setLoading(false);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,  // request GPS/WiFi, not just IP
          timeout: 15000,            // give browser up to 15 s to get a fix (was 10 s)
          maximumAge: 0,             // never use a cached position
          ...opts,
        }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setError(null);
    setAccuracyWarning(false);
  }, []);

  return { coordinates, error, loading, accuracyWarning, getCurrentPosition, clearLocation };
}