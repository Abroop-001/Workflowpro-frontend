import { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { selfServiceApi } from '../../api/selfService';
import { attendanceApi } from '../../api/attendance';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Clock, Calendar, FileText, User, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

export default function EmployeeDashboard() {
  const { success, error } = useToast();
  
  // Fetch self-service profile
  const { data: profileData, loading: profileLoading, error: profileErr } = useFetch(selfServiceApi.getProfile);
  
  // Fetch leave balances for current year
  const currentYear = new Date().getFullYear();
  const { data: leaveBalance, loading: leaveLoading } = useFetch(
    () => selfServiceApi.getLeaveBalance(currentYear),
    null,
    []
  );

  // States for today's attendance status
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [checkingAttendance, setCheckingAttendance] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch today's attendance record
  const fetchTodayAttendance = async () => {
    setCheckingAttendance(true);
    try {
      const res = await attendanceApi.getToday();
      setTodayAttendance(res.data?.data?.attendance || res.data?.attendance || null);
    } catch (err) {
      console.error('Failed to get today attendance', err);
    } finally {
      setCheckingAttendance(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceApi.checkIn({ remarks });
      success('Checked in successfully!');
      setRemarks('');
      await fetchTodayAttendance();
    } catch (err) {
      error(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance?._id) return;
    setActionLoading(true);
    try {
      await attendanceApi.checkOut({ attendanceId: todayAttendance._id });
      success('Checked out successfully!');
      await fetchTodayAttendance();
    } catch (err) {
      error(err.response?.data?.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (profileLoading) return <Loading />;
  
  const user = profileData?.user || {};
  const employee = profileData?.employee || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user.name}</h1>
          <p className="page-subtitle">{employee.jobInfo?.designation || 'Employee'} • {employee.department?.name || 'Unassigned Department'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:grid-cols-3">
        {/* Profile Card */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card className="card-padded" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="avatar avatar-lg">
                {user.name ? user.name[0].toUpperCase() : 'E'}
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{user.name}</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>{user.email}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Employee ID: {employee.employeeId || 'N/A'} • Joined: {employee.jobInfo?.joiningDate ? new Date(employee.jobInfo.joiningDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </Card>

            {/* Check-In/Out Widget */}
            <Card className="card-padded-lg">
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} /> Attendance Check-in
              </h3>
              
              {checkingAttendance ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}><Loading /></div>
              ) : todayAttendance ? (
                <div>
                  <div className="badge badge-success" style={{ marginBottom: '12px', padding: '4px 10px' }}>
                    <CheckCircle2 size={13} /> Checked In Today
                  </div>
                  <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p style={{ margin: 0 }}>
                      <strong>Checked In At:</strong> {new Date(todayAttendance.checkIn).toLocaleTimeString()}
                    </p>
                    {todayAttendance.checkOut ? (
                      <p style={{ margin: 0 }}>
                        <strong>Checked Out At:</strong> {new Date(todayAttendance.checkOut).toLocaleTimeString()}
                      </p>
                    ) : (
                      <p style={{ margin: 0, color: 'var(--text-muted)' }}>Working in progress...</p>
                    )}
                  </div>

                  {!todayAttendance.checkOut && (
                    <Button 
                      onClick={handleCheckOut} 
                      loading={actionLoading} 
                      variant="danger" 
                      className="mt-4"
                      style={{ gap: '6px' }}
                    >
                      <LogOut size={14} /> Check Out
                    </Button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                  <Input 
                    label="Add remarks (optional)" 
                    placeholder="e.g. Work from home, Client site..." 
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                  />
                  <Button 
                    onClick={handleCheckIn} 
                    loading={actionLoading} 
                    style={{ gap: '6px', alignSelf: 'flex-start' }}
                  >
                    <LogIn size={14} /> Check In Now
                  </Button>
                </div>
              )}
            </Card>

            {/* Leave Balance Stats */}
            <Card className="card-padded-lg">
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} /> Annual Leave Allocation
              </h3>
              {leaveLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}><Loading /></div>
              ) : leaveBalance ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                  <div style={{ border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>Casual Leaves</p>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0 0 0' }}>{leaveBalance.casual?.used || 0} / {leaveBalance.casual?.allocated || 0}</h4>
                  </div>
                  <div style={{ border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>Sick Leaves</p>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0 0 0' }}>{leaveBalance.sick?.used || 0} / {leaveBalance.sick?.allocated || 0}</h4>
                  </div>
                  <div style={{ border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>Paid Leaves</p>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0 0 0' }}>{leaveBalance.paid?.used || 0} / {leaveBalance.paid?.allocated || 0}</h4>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>No leave balances allocated for this year yet.</p>
              )}
            </Card>
          </div>
        </div>

        {/* Sidebar/Quick actions */}
        <div>
          <Card className="card-padded-lg" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Self Service Tabs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button onClick={() => window.location.href = '/attendance'} variant="secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: '8px' }}>
                <Clock size={15} /> My Attendance Logs
              </Button>
              <Button onClick={() => window.location.href = '/leaves'} variant="secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: '8px' }}>
                <Calendar size={15} /> Request Leave
              </Button>
              <Button onClick={() => window.location.href = '/payslips'} variant="secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: '8px' }}>
                <FileText size={15} /> View Payslips
              </Button>
              <Button onClick={() => window.location.href = '/performance'} variant="secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: '8px' }}>
                <User size={15} /> Performance reviews
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
