import { useFetch } from '../../hooks/useFetch';
import { dashboardApi } from '../../api/dashboard';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Calendar, Award } from 'lucide-react';

export default function ManagerDashboard() {
  const { data, loading, error, refetch } = useFetch(dashboardApi.getStats);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const stats = data?.stats || data || {};
  const activeEmployees = stats.employeeCounts?.active || 0;
  const totalEmployees = stats.employeeCounts?.total || 0;
  const presentToday = stats.attendanceSummary?.presentToday || 0;
  const onLeaveToday = stats.attendanceSummary?.onLeaveToday || 0;
  const pendingLeaves = stats.pendingLeaves || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manager Dashboard</h1>
          <p className="page-subtitle">
            Monitor attendance, review leave requests, and track employee performance.
          </p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div
            className="stat-card-icon"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <Users size={20} />
          </div>
          <div>
            <h4 className="stat-card-value">
              {activeEmployees} / {totalEmployees}
            </h4>
            <p className="stat-card-label">Active Employees</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-card-icon"
            style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
          >
            <UserCheck size={20} />
          </div>
          <div>
            <h4 className="stat-card-value">{presentToday}</h4>
            <p className="stat-card-label">Present Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-card-icon"
            style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}
          >
            <Calendar size={20} />
          </div>
          <div>
            <h4 className="stat-card-value">{onLeaveToday}</h4>
            <p className="stat-card-label">On Leave Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-card-icon"
            style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
          >
            <Calendar size={20} />
          </div>
          <div>
            <h4 className="stat-card-value">{pendingLeaves}</h4>
            <p className="stat-card-label">Pending Leave Requests</p>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        <Card className="card-padded-lg">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
            Quick Actions
          </h3>

          <div className="quick-actions">
            <Link to="/employees" className="quick-action-tile">
              <Users size={18} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Employees
              </span>
            </Link>

            <Link to="/attendance" className="quick-action-tile">
              <UserCheck size={18} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Attendance
              </span>
            </Link>

            <Link to="/leaves" className="quick-action-tile">
              <Calendar size={18} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Leave Requests
              </span>
            </Link>

            <Link to="/performance" className="quick-action-tile">
              <Award size={18} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Performance
              </span>
            </Link>
          </div>
        </Card>

        <Card className="card-padded-lg">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
            Responsibilities
          </h3>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            Review employee attendance, approve or reject leave requests assigned
            to you, monitor team performance, and complete performance reviews as
            permitted by your role.
          </p>
        </Card>
      </div>
    </div>
  );
}