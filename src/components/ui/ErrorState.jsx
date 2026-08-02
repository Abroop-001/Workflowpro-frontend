import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="error-state">
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'var(--danger-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        <AlertCircle size={20} color="var(--danger)" />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
        Failed to load
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 300, marginBottom: onRetry ? 16 : 0 }}>
        {message}
      </p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry} style={{ gap: 6 }}>
          <RefreshCw size={13} />
          Try again
        </button>
      )}
    </div>
  );
}
