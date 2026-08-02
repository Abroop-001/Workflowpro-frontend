import { useFetch } from '../../hooks/useFetch';
import { dashboardApi } from '../../api/dashboard';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Calendar, Clock, FolderPlus, FileText } from 'lucide-react';

export default function HRDashboard() {
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
          <h1 className="page-title">HR Operations Dashboard</h1>
          <p className="page-subtitle">Oversee attendance, manage employee files, and review leave applications</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Users size={20} />
          </div>
          <div>
            <h4 className="stat-card-value">{activeEmployees} / {totalEmployees}</h4>
            <p className="stat-card-label">Active Employees</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <h4 className="stat-card-value">{presentToday}</h4>
            <p className="stat-card-label">Present Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <Calendar size={20} />
          </div>
          <div>
            <h4 className="stat-card-value">{onLeaveToday}</h4>
            <p className="stat-card-label">On Leave Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
            <Calendar size={20} />
          </div>
          <div>
            <h4 className="stat-card-value">{pendingLeaves}</h4>
            <p className="stat-card-label">Pending Approvals</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Operations */}
        <Card className="card-padded-lg">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>HR Actions</h3>
          <div className="quick-actions">
            <Link to="/employees" className="quick-action-tile">
              <Users size={18} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Directory</span>
            </Link>

            <Link to="/attendance" className="quick-action-tile">
              <Clock size={18} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Daily Attendance</span>
            </Link>

            <Link to="/leaves" className="quick-action-tile">
              <Calendar size={18} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Leave Requests</span>
            </Link>

            <Link to="/payroll" className="quick-action-tile">
              <FileText size={18} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Run Payroll</span>
            </Link>
          </div>
        </Card>

        {/* Info Box */}
        <Card className="card-padded-lg">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Resource Allocation</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Verify shifts details, generate monthly payroll statements, keep employee data up to date, and review active department goals.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <Link to="/departments" className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
              <FolderPlus size={14} /> Departments
            </Link>
            <Link to="/shifts" className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
              <Clock size={14} /> Work Shifts
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
