import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { attendanceApi } from '../../api/attendance';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { Clock, LogIn, LogOut, Search, Filter, Calendar, User, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export default function AttendancePage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const isStaffView = ['COMPANY_ADMIN', 'HR', 'MANAGER'].includes(user?.role);
  
  // Tab for managers to toggle between self attendance and team attendance
  const [viewTab, setViewTab] = useState(isStaffView ? 'staff' : 'self');

  // Self Attendance States
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [selfHistory, setSelfHistory] = useState([]);
  const [selfFilters, setSelfFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });
  const [selfPage, setSelfPage] = useState(1);
  const itemsPerPage = 10;

  // Staff Attendance States
  const [staffLogs, setStaffLogs] = useState([]);
  const [staffFilters, setStaffFilters] = useState({
    search: '',
    status: '',
    date: new Date().toISOString().split('T')[0] // default today
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [empHistoryFilters, setEmpHistoryFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });

  // APIs
  const fetchTodayApi = useApi(() => attendanceApi.getToday());
  const checkInApi = useApi((data) => attendanceApi.checkIn(data));
  const checkOutApi = useApi((data) => attendanceApi.checkOut(data));
  const fetchSelfHistoryApi = useApi((id, params) => attendanceApi.getEmployeeHistory(id, params));
  
  const fetchStaffLogsApi = useApi((params) => api.get('/attendance', { params }));
  const fetchEmpHistoryApi = useApi((id, params) => attendanceApi.getEmployeeHistory(id, params));

  // Load self today & history
  const loadSelfData = async () => {
    try {
      const todayRes = await fetchTodayApi.execute();
      setTodayAttendance(todayRes.data?.data?.attendance || todayRes.data?.attendance || null);

      if (user?.employeeId || user?.id) {
        // Find self employee profile first
        const empRes = await api.get('/self-service/profile');
        const empId = empRes.data?.data?.employee?._id || empRes.data?.employee?._id;
        if (empId) {
          const histRes = await fetchSelfHistoryApi.execute(empId, selfFilters);
          setSelfHistory(histRes.data?.data?.attendance || histRes.data?.attendance || histRes.attendance || []);
        }
      }
    } catch (err) {
      console.error(err);
      error('Failed to load your attendance data.');
    }
  };

  // Load staff records
  const loadStaffData = async () => {
    try {
      const res = await fetchStaffLogsApi.execute(staffFilters);
      setStaffLogs(res.data?.data?.attendances || res.data?.attendances || res.attendances || []);
    } catch (err) {
      console.error(err);
      error('Failed to load daily staff logs.');
    }
  };

  // Load selected employee history
  const loadEmployeeHistory = async (empId) => {
    try {
      const res = await fetchEmpHistoryApi.execute(empId, empHistoryFilters);
      setEmployeeHistory(res.data?.data?.attendance || res.data?.attendance || res.attendance || []);
    } catch (err) {
      console.error(err);
      error('Failed to load employee history.');
    }
  };

  useEffect(() => {
    if (viewTab === 'self') {
      loadSelfData();
    } else {
      loadStaffData();
    }
  }, [viewTab, selfFilters, staffFilters]);

  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeeHistory(selectedEmployee._id);
    }
  }, [selectedEmployee, empHistoryFilters]);

  const handleCheckIn = async () => {
    try {
      await checkInApi.execute({ remarks });
      success('Checked in successfully!');
      setRemarks('');
      loadSelfData();
    } catch (err) {
      error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;
    try {
      await checkOutApi.execute({ attendanceId: todayAttendance._id });
      success('Checked out successfully!');
      loadSelfData();
    } catch (err) {
      error(err.response?.data?.message || 'Check-out failed');
    }
  };

  // Format helper
  const formatTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Pagination helper
  const paginate = (items, page, size) => {
    const start = (page - 1) * size;
    return items.slice(start, start + size);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">Track check-ins, working hours, and check-out history</p>
        </div>
      </div>

      {/* Tabs */}
      {isStaffView && (
        <div className="tabs">
          <button 
            className={`tab-btn ${viewTab === 'staff' ? 'active' : ''}`}
            onClick={() => { setViewTab('staff'); setSelectedEmployee(null); }}
          >
            Staff Directory Logs
          </button>
          <button 
            className={`tab-btn ${viewTab === 'self' ? 'active' : ''}`}
            onClick={() => setViewTab('self')}
          >
            My Attendance
          </button>
        </div>
      )}

      {/* SELF ATTENDANCE tab */}
      {viewTab === 'self' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }} className="flex flex-col md:grid">
          {/* Action check-in card */}
          <Card className="card-padded-lg">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} /> Today's Status
            </h3>

            {fetchTodayApi.loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Spinner /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', background: todayAttendance ? 'var(--success-bg)' : 'var(--warning-bg)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Status</p>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: todayAttendance ? 'var(--success)' : 'var(--warning)' }}>
                    {todayAttendance ? (todayAttendance.checkOut ? 'COMPLETED' : 'ACTIVE WORK SESSION') : 'NOT CHECKED IN'}
                  </h4>
                </div>

                {todayAttendance && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Check In:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formatTime(todayAttendance.checkIn)}</strong>
                    </div>
                    {todayAttendance.checkOut && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Check Out:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{formatTime(todayAttendance.checkOut)}</strong>
                      </div>
                    )}
                    {todayAttendance.workingHours !== undefined && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Working Hours:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{todayAttendance.workingHours} hrs</strong>
                      </div>
                    )}
                  </div>
                )}

                {!todayAttendance && (
                  <>
                    <Input 
                      placeholder="Add check-in remarks (optional)..."
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                    />
                    <Button onClick={handleCheckIn} loading={checkInApi.loading}>
                      <LogIn size={15} /> Check In
                    </Button>
                  </>
                )}

                {todayAttendance && !todayAttendance.checkOut && (
                  <Button variant="danger" onClick={handleCheckOut} loading={checkOutApi.loading}>
                    <LogOut size={15} /> Check Out
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Self History list */}
          <Card className="card-padded-lg">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>My Attendance Logs</h3>
            
            {/* Self filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ width: '130px' }}>
                <select
                  value={selfFilters.status}
                  onChange={e => setSelfFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field"
                  style={{ height: '38px' }}
                >
                  <option value="">All Statuses</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <Input 
                  type="date" 
                  label="Start Date" 
                  value={selfFilters.startDate} 
                  onChange={e => setSelfFilters(prev => ({ ...prev, startDate: e.target.value }))} 
                />
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <Input 
                  type="date" 
                  label="End Date" 
                  value={selfFilters.endDate} 
                  onChange={e => setSelfFilters(prev => ({ ...prev, endDate: e.target.value }))} 
                />
              </div>
            </div>

            {fetchSelfHistoryApi.loading && selfHistory.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>
            ) : selfHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <Calendar size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ margin: 0 }}>No attendance history found.</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginate(selfHistory, selfPage, itemsPerPage).map((log) => (
                        <tr key={log._id}>
                          <td style={{ fontWeight: 500 }}>{formatDate(log.date)}</td>
                          <td>{formatTime(log.checkIn)}</td>
                          <td>{formatTime(log.checkOut)}</td>
                          <td>{log.workingHours ? `${log.workingHours} hrs` : 'N/A'}</td>
                          <td>
                            <span className={`badge ${log.status === 'LEAVE' ? 'badge-info' : log.status === 'ABSENT' ? 'badge-danger' : 'badge-success'}`}>
                              {log.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{log.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {selfHistory.length > itemsPerPage && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Showing {((selfPage - 1) * itemsPerPage) + 1} - {Math.min(selfPage * itemsPerPage, selfHistory.length)} of {selfHistory.length}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="secondary" disabled={selfPage === 1} onClick={() => setSelfPage(p => p - 1)} style={{ padding: '6px 12px' }}>Prev</Button>
                      <Button variant="secondary" disabled={selfPage * itemsPerPage >= selfHistory.length} onClick={() => setSelfPage(p => p + 1)} style={{ padding: '6px 12px' }}>Next</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}

      {/* STAFF DIRECTORY tab */}
      {viewTab === 'staff' && !selectedEmployee && (
        <Card className="card-padded-lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Staff Daily Logs</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '200px' }}>
                <Input
                  placeholder="Search staff name..."
                  value={staffFilters.search}
                  onChange={e => setStaffFilters(prev => ({ ...prev, search: e.target.value }))}
                  style={{ paddingLeft: '32px' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              </div>
              <div style={{ width: '130px' }}>
                <select
                  value={staffFilters.status}
                  onChange={e => setStaffFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field"
                  style={{ height: '38px' }}
                >
                  <option value="">All Statuses</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </div>
              <div style={{ width: '160px' }}>
                <Input
                  type="date"
                  value={staffFilters.date}
                  onChange={e => setStaffFilters(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {fetchStaffLogsApi.loading && staffLogs.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>
          ) : staffLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <User size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ margin: 0 }}>No check-in records for selected date.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Working Hours</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffLogs.map((log) => {
                    const empName = log.employee 
                      ? `${log.employee.personalInfo?.firstName || ''} ${log.employee.personalInfo?.lastName || ''}`
                      : 'Unknown Employee';
                    return (
                      <tr key={log._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedEmployee(log.employee)}>
                        <td style={{ fontWeight: 600 }}>{empName}</td>
                        <td>{formatDate(log.date)}</td>
                        <td>{formatTime(log.checkIn)}</td>
                        <td>{formatTime(log.checkOut)}</td>
                        <td>{log.workingHours ? `${log.workingHours} hrs` : 'N/A'}</td>
                        <td>
                          <span className={`badge ${log.status === 'LEAVE' ? 'badge-info' : log.status === 'ABSENT' ? 'badge-danger' : 'badge-success'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <Button variant="secondary" onClick={() => setSelectedEmployee(log.employee)} style={{ padding: '4px 10px', height: '28px', minWidth: 'unset' }}>
                            View History
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* SELECTED EMPLOYEE HISTORY VIEW */}
      {viewTab === 'staff' && selectedEmployee && (
        <Card className="card-padded-lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setSelectedEmployee(null)} className="topnav-toggle" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                  Attendance History: {selectedEmployee.personalInfo?.firstName} {selectedEmployee.personalInfo?.lastName}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  {selectedEmployee.jobInfo?.title || 'Staff member'} - {selectedEmployee.jobInfo?.department?.name || ''}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '130px' }}>
                <select
                  value={empHistoryFilters.status}
                  onChange={e => setEmpHistoryFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field"
                  style={{ height: '38px' }}
                >
                  <option value="">All Statuses</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </div>
              <div style={{ width: '140px' }}>
                <Input 
                  type="date" 
                  value={empHistoryFilters.startDate} 
                  onChange={e => setEmpHistoryFilters(prev => ({ ...prev, startDate: e.target.value }))} 
                />
              </div>
              <div style={{ width: '140px' }}>
                <Input 
                  type="date" 
                  value={empHistoryFilters.endDate} 
                  onChange={e => setEmpHistoryFilters(prev => ({ ...prev, endDate: e.target.value }))} 
                />
              </div>
            </div>
          </div>

          {fetchEmpHistoryApi.loading && employeeHistory.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>
          ) : employeeHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <Calendar size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ margin: 0 }}>No logs found for this employee matching the filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Working Hours</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeHistory.map((log) => (
                    <tr key={log._id}>
                      <td style={{ fontWeight: 500 }}>{formatDate(log.date)}</td>
                      <td>{formatTime(log.checkIn)}</td>
                      <td>{formatTime(log.checkOut)}</td>
                      <td>{log.workingHours ? `${log.workingHours} hrs` : 'N/A'}</td>
                      <td>
                        <span className={`badge ${log.status === 'LEAVE' ? 'badge-info' : log.status === 'ABSENT' ? 'badge-danger' : 'badge-success'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{log.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
