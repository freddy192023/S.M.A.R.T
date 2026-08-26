import React, { createContext, useContext, useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

interface NotificationContextType {
  showNotification: (title: string, message: string, type?: Notification['type']) => void;
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotification({ id, title, message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(11, 17, 30, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: `1px solid ${
              notification.type === 'success' ? 'var(--success-color)' :
              notification.type === 'warning' ? 'var(--warning-color)' :
              notification.type === 'danger' ? 'var(--danger-color)' :
              'var(--accent-color)'
            }`,
            boxShadow: 'var(--shadow-lg), 0 0 30px rgba(0, 0, 0, 0.5)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.2rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            color: 'var(--text-main)',
            position: 'relative',
            transform: 'scale(1)',
            animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {/* Ícono dinámico */}
            <div style={{
              fontSize: '3.5rem',
              marginBottom: '1rem',
              lineHeight: 1
            }}>
              {notification.type === 'success' ? '✅' :
               notification.type === 'warning' ? '⚠️' :
               notification.type === 'danger' ? '❌' : 'ℹ️'}
            </div>

            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              marginBottom: '0.8rem',
              color: 'var(--text-main)'
            }}>
              {notification.title}
            </h3>

            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              marginBottom: '2rem'
            }}>
              {notification.message}
            </p>

            <button
              onClick={closeNotification}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.8rem 1.5rem',
                justifyContent: 'center',
                boxShadow: `0 4px 14px ${
                  notification.type === 'success' ? 'rgba(16, 185, 129, 0.2)' :
                  notification.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' :
                  notification.type === 'danger' ? 'rgba(239, 68, 68, 0.2)' :
                  'var(--accent-glow)'
                }`,
                background:
                  notification.type === 'success' ? 'var(--success-color)' :
                  notification.type === 'warning' ? 'var(--warning-color)' :
                  notification.type === 'danger' ? 'var(--danger-color)' :
                  'var(--accent-color)',
                color: 'var(--bg-primary)'
              }}
            >
              Aceptar
            </button>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
