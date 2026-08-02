import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onRemove }) {
  return (
    <div className={`toast ${toast.type}`}>
      <ToastIcon type={toast.type} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, lineHeight: 1 }}
      >✕</button>
    </div>
  );
}

function ToastIcon({ type }) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i',
  };
  const colors = {
    success: 'var(--success)',
    error: 'var(--danger)',
    warning: 'var(--warning)',
    info: 'var(--info)',
  };
  return (
    <div style={{
      width: 18, height: 18, borderRadius: '50%',
      background: colors[type],
      color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '10px', fontWeight: 700, flexShrink: 0,
    }}>
      {icons[type]}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');

  return {
    success: (msg) => ctx.addToast(msg, 'success'),
    error:   (msg) => ctx.addToast(msg, 'error'),
    warning: (msg) => ctx.addToast(msg, 'warning'),
    info:    (msg) => ctx.addToast(msg, 'info'),
  };
}
