import { useFetch } from '../../hooks/useFetch';
import { dashboardApi } from '../../api/dashboard';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import { Link } from 'react-router-dom';
import { 
  Users, UserCheck, Calendar, FileText, ArrowRight, Clock, FolderPlus, Settings
} from 'lucide-react';

export default function CompanyAdminDashboard() {
  const { data, loading, error, refetch } = useFetch(dashboardApi.getStats);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const stats = data?.stats || data || {};
  const activeEmployees = stats.employeeCounts?.active || 0;
  const totalEmployees = stats.employeeCounts?.total || 0;
  const presentToday = stats.attendanceSummary?.presentToday || 0;
  const onLeaveToday = stats.attendanceSummary?.onLeaveToday || 0;
  const pendingLeaves = stats.pendingLeaves || 0;
  const netSalaryTotal = stats.payrollSummary?.latestNetSalaryTotal || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Admin Dashboard</h1>
          <p className="page-subtitle">Track key operations, attendance, leaves, and payroll</p>
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
            <p className="stat-card-label">Active / Total Employees</p>
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
            <p className="stat-card-label">Pending Leaves</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
            <FileText size={20} />
          </div>
          <div>
            <h4 className="stat-card-value">₹{netSalaryTotal.toLocaleString()}</h4>
            <p className="stat-card-label">Net Salary Distributed</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Quick Actions */}
        <Card className="card-padded-lg">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Quick Operations</h3>
          <div className="quick-actions">
            <Link to="/employees" className="quick-action-tile">
              <Users size={18} className="text-blue-600" />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Manage Employees</span>
            </Link>

            <Link to="/departments" className="quick-action-tile">
              <FolderPlus size={18} className="text-green-600" />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Departments</span>
            </Link>

            <Link to="/shifts" className="quick-action-tile">
              <Clock size={18} className="text-yellow-600" />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Work Shifts</span>
            </Link>

            <Link to="/payroll" className="quick-action-tile">
              <FileText size={18} className="text-purple-600" />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Run Payroll</span>
            </Link>
          </div>
        </Card>

        {/* Company Settings Banner */}
        <Card className="card-padded-lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={16} /> Company Administration
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Assign permissions, manage departments structure, set up company-wide shifts, and supervise leave policy approvals.
            </p>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/audit-logs" className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
              Audit Logs <ArrowRight size={13} />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
