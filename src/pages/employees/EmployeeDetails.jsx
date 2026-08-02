import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { employeeApi } from '../../api/employees';
import { attendanceApi } from '../../api/attendance';
import { leaveApi } from '../../api/leaves';
import { payrollApi } from '../../api/payroll';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import StatusBadge from '../../components/ui/StatusBadge';
import { Calendar, User, Briefcase, Mail, Phone, CalendarDays, ArrowLeft, Clock, CreditCard } from 'lucide-react';

export default function EmployeeDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  // Fetch employee details
  const { data: employee, loading: loadingEmp, error: errorEmp, refetch: refetchEmp } = useFetch(
    () => employeeApi.getById(id),
    null,
    [id]
  );

  // Fetch employee attendance logs
  const { data: attendanceLogs, loading: loadingAtt } = useFetch(
    () => attendanceApi.getEmployeeHistory(id),
    null,
    [id]
  );

  // Fetch employee leaves history
  const { data: leaveLogs, loading: loadingLeaves } = useFetch(
    () => leaveApi.getEmployeeLeaves(id),
    null,
    [id]
  );

  // Fetch employee payroll logs
  const { data: payrollLogs, loading: loadingPayroll } = useFetch(
    () => payrollApi.getByEmployee(id),
    null,
    [id]
  );

  if (user?.role === 'EMPLOYEE') {
    return (
      <Card className="card-padded" style={{ margin: '20px auto', maxWidth: '600px' }}>
        <ErrorState message="Access Denied: You do not have permission to view employee details." />
      </Card>
    );
  }

  if (loadingEmp) return <Loading />;
  if (errorEmp) return <ErrorState message={errorEmp} onRetry={refetchEmp} />;
  if (!employee) return <ErrorState message="Employee not found." />;

  const personal = employee.personalInfo || {};
  const job = employee.jobInfo || {};
  const attendance = attendanceLogs?.attendance || attendanceLogs || [];
  const leaves = leaveLogs?.leaves || leaveLogs || [];
  const payrolls = payrollLogs?.payrolls || [];

  return (
    <div>
      <div className="page-header" style={{ alignItems: 'center' }}>
        <Link to="/employees" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '6px' }}>
          <ArrowLeft size={14} /> Back to Directory
        </Link>
        <div>
          <StatusBadge status={employee.status} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:grid-cols-3">
        {/* Left Column: Basic Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card className="card-padded" style={{ textAlign: 'center' }}>
            <div className="avatar avatar-xl" style={{ margin: '0 auto 16px' }}>
              {personal.firstName ? personal.firstName[0].toUpperCase() : 'E'}
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>
              {personal.firstName} {personal.lastName}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
              {job.designation || 'Unassigned Role'}
            </p>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} color="var(--text-muted)" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{personal.email || 'No email address'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--text-muted)" />
                <span>{personal.phone || 'No phone number'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={14} color="var(--text-muted)" />
                <span>DOB: {personal.dateOfBirth ? new Date(personal.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </Card>

          {/* Job Details Card */}
          <Card className="card-padded-lg">
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={16} /> Job Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div className="detail-field">
                <span className="detail-label">Employee ID</span>
                <span className="detail-value">{employee.employeeId}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Department</span>
                <span className="detail-value">{employee.department?.name || 'Unassigned'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Employment Type</span>
                <span className="detail-value">{job.employmentType?.replace('_', ' ') || 'FULL TIME'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Joining Date</span>
                <span className="detail-value">{job.joiningDate ? new Date(job.joiningDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Compensation (INR)</span>
                <span className="detail-value">₹{(employee.salary || 0).toLocaleString()} / year</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Attendance & Leaves history */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Attendance History */}
          <Card className="card-padded-lg">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} /> Recent Attendance Logs
            </h3>
            
            {loadingAtt ? (
              <Loading />
            ) : attendance.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>No attendance logs found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Hours worked</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.slice(0, 5).map(log => (
                      <tr key={log._id}>
                        <td>{new Date(log.date).toLocaleDateString()}</td>
                        <td>{log.checkIn ? new Date(log.checkIn).toLocaleTimeString() : '—'}</td>
                        <td>{log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : '—'}</td>
                        <td>{log.workingHours ? `${log.workingHours.toFixed(1)} hrs` : '—'}</td>
                        <td><StatusBadge status={log.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Leave Application History */}
          <Card className="card-padded-lg">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} /> Leave History
            </h3>

            {loadingLeaves ? (
              <Loading />
            ) : leaves.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>No leave applications found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.slice(0, 5).map(leave => (
                      <tr key={leave._id}>
                        <td style={{ fontWeight: 600 }}>{leave.leaveType}</td>
                        <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                        <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                        <td>{leave.totalDays}</td>
                        <td><StatusBadge status={leave.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Payroll History */}
          <Card className="card-padded-lg">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={16} /> Payroll Summary
            </h3>

            {loadingPayroll ? (
              <Loading />
            ) : payrolls.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>No payroll history found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Basic Salary</th>
                      <th>Allowances</th>
                      <th>Deductions</th>
                      <th>Net Paid</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.slice(0, 5).map(pr => (
                      <tr key={pr._id}>
                        <td style={{ fontWeight: 600 }}>{pr.month}/{pr.year}</td>
                        <td>₹{pr.basicSalary?.toLocaleString()}</td>
                        <td>₹{pr.allowances?.toLocaleString()}</td>
                        <td>₹{pr.deductions?.toLocaleString()}</td>
                        <td style={{ fontWeight: 600 }}>₹{pr.netSalary?.toLocaleString()}</td>
                        <td><StatusBadge status={pr.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
