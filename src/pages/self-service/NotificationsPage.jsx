import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { notificationApi } from '../../api/notifications';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { Bell, CheckSquare, Calendar } from 'lucide-react';

export default function NotificationsPage() {
  const { success, error } = useToast();
  const { data: notifications, loading, error: fetchError, refetch } = useFetch(
    () => notificationApi.getAll({ limit: 50 }),
    null,
    []
  );
  const [markingId, setMarkingId] = useState(null);

  const handleMarkAsRead = async (id) => {
    setMarkingId(id);
    try {
      await notificationApi.markAsRead(id);
      success('Notification marked as read.');
      refetch();
    } catch (err) {
      console.error(err);
      error('Failed to update notification status.');
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) return <Loading />;
  if (fetchError) return <ErrorState message={fetchError} onRetry={refetch} />;

  const list = notifications || [];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay updated with leave approvals, company announcements, and payroll updates</p>
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="card-padded">
          <EmptyState 
            title="All caught up!" 
            description="You don't have any notifications at the moment." 
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {list.map(notif => (
            <Card 
              key={notif._id} 
              className="card-padded"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                borderLeft: notif.isRead ? '3px solid var(--border)' : '3px solid var(--accent)',
                backgroundColor: notif.isRead ? 'var(--card-bg)' : 'var(--bg-subtle)'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: notif.isRead ? 600 : 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                    {notif.title}
                  </span>
                  {!notif.isRead && (
                    <span className="badge badge-primary" style={{ fontSize: '9px', padding: '2px 6px' }}>New</span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                  {notif.message}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <Calendar size={12} />
                  <span>{new Date(notif.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  disabled={markingId === notif._id}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px', whiteSpace: 'nowrap' }}
                >
                  <CheckSquare size={13} /> Mark Read
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
