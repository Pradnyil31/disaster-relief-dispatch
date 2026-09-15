import { createContext, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const notify = useCallback(({ message, severity = 'info', duration = 4000 }) => {
    switch (severity) {
      case 'success':
        toast.success(message, { duration });
        break;
      case 'error':
        toast.error(message, { duration });
        break;
      case 'warning':
        toast(message, { duration, icon: '⚠️', style: { background: '#fff3cd', color: '#856404' } });
        break;
      default:
        toast(message, { duration });
    }
  }, []);

  const dismiss = useCallback((id) => {
    toast.dismiss(id);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}