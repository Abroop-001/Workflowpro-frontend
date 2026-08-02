import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { leaveApi } from '../../api/leaves';
import { selfServiceApi } from '../../api/selfService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { Calendar, Plus, CheckCircle, XCircle, Search, Filter, HelpCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function LeavesPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const isApprover = ['COMPANY_ADMIN', 'HR', 'MANAGER'].includes(user?.role);
  const [viewTab, setViewTab] = useState(isApprover ? 'pending' : 'history');

  // Employee states
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Approver states
  const [allLeaves, setAllLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Rejection modal/popup state
  const [rejectingLeaveId, setRejectingLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // APIs
  const fetchBalanceApi = useApi(() => selfServiceApi.getLeaveBalance());
  const fetchMyLeavesApi = useApi(() => selfServiceApi.getLeaves());
  const applyLeaveApi = useApi((data) => leaveApi.create(data));
  const cancelLeaveApi = useApi((id) => leaveApi.cancel(id));

  const fetchAllLeavesApi = useApi((params) => api.get('/leaves', { params }));
  const approveLeaveApi = useApi((id) => leaveApi.approve(id));
  const rejectLeaveApi = useApi((id, data) => leaveApi.reject(id, data));

  // Load employee data (leaves & balance)
  const loadEmployeeData = async () => {
    try {
      const leavesRes = await fetchMyLeavesApi.execute();
      setMyLeaves(leavesRes.data?.data || leavesRes.data || leavesRes.leaves || []);

      const balanceRes = await fetchBalanceApi.execute();
      setLeaveBalance(balanceRes.data?.data || balanceRes.data || balanceRes.balance || null);
    } catch (err) {
      console.error(err);
      // Fail silently or toast if critical, balance might not be allocated
    }
  };

  // Load admin/manager logs
  const loadApproverData = async () => {
    try {
      const res = await fetchAllLeavesApi.execute({
        search: searchQuery,
        status: statusFilter,
        leaveType: typeFilter
      });
      const data = res.data?.data?.leaves || res.data?.leaves || res.leaves || [];
      setAllLeaves(data);
      setPendingLeaves(data.filter(l => l.status === 'PENDING'));
    } catch (err) {
      console.error(err);
      error('Failed to load leave logs.');
    }
  };

  useEffect(() => {
    if (isApprover) {
      loadApproverData();
    }
    loadEmployeeData();
  }, [searchQuery, statusFilter, typeFilter]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!applyForm.startDate || !applyForm.endDate || !applyForm.reason) {
      error('Please fill in all leave request fields.');
      return;
    }
    try {
      await applyLeaveApi.execute(applyForm);
      success('Leave applied successfully!');
      setApplyForm({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
      loadEmployeeData();
      if (isApprover) loadApproverData();
      setViewTab('history');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to apply leave.');
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this approved leave?')) return;
    try {
      await cancelLeaveApi.execute(id);
      success('Leave cancelled successfully.');
      loadEmployeeData();
      if (isApprover) loadApproverData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to cancel leave.');
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this leave request?')) return;
    try {
      await approveLeaveApi.execute(id);
      success('Leave request approved.');
      loadApproverData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to approve leave request.');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      error('Please enter a rejection reason.');
      return;
    }
    try {
      await rejectLeaveApi.execute(rejectingLeaveId, { rejectionReason });
      success('Leave request rejected.');
      setRejectingLeaveId(null);
      setRejectionReason('');
      loadApproverData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reject leave request.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Pagination helper
  const paginate = (items, page, size) => {
    const start = (page - 1) * size;
    return items.slice(start, start + size);
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-warning">Pending</span>;
      case 'APPROVED':
        return <span className="badge badge-success">Approved</span>;
      case 'REJECTED':
        return <span className="badge badge-danger">Rejected</span>;
      case 'CANCELLED':
        return <span className="badge badge-secondary">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">Submit leave applications, track status, and manage approvals</p>
        </div>
      </div>

      {/* Leave Balance summary for employees */}
      {leaveBalance && (
        <Card className="card-padded" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>My Annual Leave Balance ({leaveBalance.year})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-inset)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>CASUAL</p>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                {leaveBalance.casual?.used || 0} / {leaveBalance.casual?.allocated || 0}
              </h4>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-inset)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>SICK</p>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                {leaveBalance.sick?.used || 0} / {leaveBalance.sick?.allocated || 0}
              </h4>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-inset)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>PAID</p>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                {leaveBalance.paid?.used || 0} / {leaveBalance.paid?.allocated || 0}
              </h4>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-inset)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>UNPAID</p>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                {leaveBalance.unpaid?.used || 0} / {leaveBalance.unpaid?.allocated || 0}
              </h4>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="tabs">
        {isApprover && (
          <button 
            className={`tab-btn ${viewTab === 'pending' ? 'active' : ''}`}
            onClick={() => setViewTab('pending')}
          >
            Pending Approvals ({pendingLeaves.length})
          </button>
        )}
        {isApprover && (
          <button 
            className={`tab-btn ${viewTab === 'directory' ? 'active' : ''}`}
            onClick={() => setViewTab('directory')}
          >
            All Leave Records
          </button>
        )}
        <button 
          className={`tab-btn ${viewTab === 'apply' ? 'active' : ''}`}
          onClick={() => setViewTab('apply')}
        >
          Apply for Leave
        </button>
        <button 
          className={`tab-btn ${viewTab === 'history' ? 'active' : ''}`}
          onClick={() => setViewTab('history')}
        >
          My Leave History
        </button>
      </div>

      {/* Tab: PENDING APPROVALS */}
      {viewTab === 'pending' && isApprover && (
        <Card className="card-padded-lg">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Leave Requests Awaiting Action</h3>
          {pendingLeaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <CheckCircle size={40} style={{ opacity: 0.3, color: 'var(--success)', marginBottom: '12px' }} />
              <p style={{ margin: 0 }}>No pending requests. All clear!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.map((leave) => {
                    const empName = leave.employee 
                      ? `${leave.employee.personalInfo?.firstName || ''} ${leave.employee.personalInfo?.lastName || ''}`
                      : 'Staff Member';
                    return (
                      <tr key={leave._id}>
                        <td style={{ fontWeight: 600 }}>{empName}</td>
                        <td style={{ fontWeight: 500 }}>{leave.leaveType}</td>
                        <td>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</td>
                        <td>{leave.totalDays} day(s)</td>
                        <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {leave.reason}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <Button 
                              variant="success" 
                              onClick={() => handleApprove(leave._id)}
                              style={{ padding: '4px 10px', height: '28px', minWidth: 'unset' }}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="danger" 
                              onClick={() => setRejectingLeaveId(leave._id)}
                              style={{ padding: '4px 10px', height: '28px', minWidth: 'unset' }}
                            >
                              Reject
                            </Button>
                          </div>
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

      {/* Tab: ALL LEAVE RECORDS */}
      {viewTab === 'directory' && isApprover && (
        <Card className="card-padded-lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Company Leave Directory</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '200px' }}>
                <Input
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              </div>
              <div style={{ width: '130px' }}>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="input-field"
                  style={{ height: '38px' }}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div style={{ width: '130px' }}>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="input-field"
                  style={{ height: '38px' }}
                >
                  <option value="">All Types</option>
                  <option value="CASUAL">Casual</option>
                  <option value="SICK">Sick</option>
                  <option value="PAID">Paid</option>
                  <option value="UNPAID">Unpaid</option>
                </select>
              </div>
            </div>
          </div>

          {fetchAllLeavesApi.loading && allLeaves.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>
          ) : allLeaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <Calendar size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ margin: 0 }}>No leave applications found.</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th>Reason</th>
                      <th>Approver Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginate(allLeaves, currentPage, itemsPerPage).map((leave) => {
                      const empName = leave.employee 
                        ? `${leave.employee.personalInfo?.firstName || ''} ${leave.employee.personalInfo?.lastName || ''}`
                        : 'Staff Member';
                      return (
                        <tr key={leave._id}>
                          <td style={{ fontWeight: 600 }}>{empName}</td>
                          <td style={{ fontWeight: 500 }}>{leave.leaveType}</td>
                          <td>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</td>
                          <td>{leave.totalDays} day(s)</td>
                          <td>{renderStatusBadge(leave.status)}</td>
                          <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{leave.reason}</td>
                          <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                            {leave.status === 'REJECTED' ? leave.rejectionReason : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {allLeaves.length > itemsPerPage && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, allLeaves.length)} of {allLeaves.length}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '6px 12px' }}>Prev</Button>
                    <Button variant="secondary" disabled={currentPage * itemsPerPage >= allLeaves.length} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '6px 12px' }}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Tab: APPLY FOR LEAVE */}
      {viewTab === 'apply' && (
        <Card className="card-padded-lg" style={{ maxWidth: '600px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Submit Leave Request</h3>
          <form onSubmit={handleApplyLeave} className="flex flex-col gap-4">
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Leave Type</label>
              <select
                value={applyForm.leaveType}
                onChange={e => setApplyForm(prev => ({ ...prev, leaveType: e.target.value }))}
                className="input-field"
                required
              >
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="PAID">Paid Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
                <option value="OTHER">Other Leave</option>
              </select>
            </div>

            <div className="form-grid">
              <Input 
                type="date" 
                label="Start Date" 
                required
                value={applyForm.startDate} 
                onChange={e => setApplyForm(prev => ({ ...prev, startDate: e.target.value }))} 
              />
              <Input 
                type="date" 
                label="End Date" 
                required
                value={applyForm.endDate} 
                onChange={e => setApplyForm(prev => ({ ...prev, endDate: e.target.value }))} 
              />
            </div>

            <Input 
              label="Reason for Leave" 
              placeholder="Provide a brief explanation of your request..."
              required
              value={applyForm.reason} 
              onChange={e => setApplyForm(prev => ({ ...prev, reason: e.target.value }))} 
            />

            <Button type="submit" loading={applyLeaveApi.loading} style={{ marginTop: '12px' }}>
              <Plus size={15} /> Submit Application
            </Button>
          </form>
        </Card>
      )}

      {/* Tab: MY LEAVE HISTORY */}
      {viewTab === 'history' && (
        <Card className="card-padded-lg">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>My Applications</h3>
          
          {fetchMyLeavesApi.loading && myLeaves.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>
          ) : myLeaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <Calendar size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ margin: 0 }}>You haven't requested any leaves yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Feedback / Note</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td style={{ fontWeight: 600 }}>{leave.leaveType}</td>
                      <td>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</td>
                      <td>{leave.totalDays} day(s)</td>
                      <td>{renderStatusBadge(leave.status)}</td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{leave.reason}</td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        {leave.status === 'REJECTED' ? leave.rejectionReason : '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {leave.status === 'APPROVED' && (
                          <Button 
                            variant="danger" 
                            onClick={() => handleCancelLeave(leave._id)}
                            loading={cancelLeaveApi.loading}
                            style={{ padding: '4px 10px', height: '28px', minWidth: 'unset' }}
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Reject Leave modal prompt */}
      {rejectingLeaveId && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <Card className="card-padded-lg" style={{ width: '400px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Reject Leave Request</h3>
            <form onSubmit={handleRejectSubmit} className="flex flex-col gap-4">
              <Input
                label="Reason for Rejection"
                placeholder="Explain why the leave request is being rejected..."
                required
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Button type="submit" variant="danger" loading={rejectLeaveApi.loading} style={{ flex: 1 }}>
                  Confirm Reject
                </Button>
                <Button type="button" variant="secondary" onClick={() => setRejectingLeaveId(null)} style={{ flex: 1 }}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
