import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import { auditLogApi } from '../../api/auditLogs';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { Activity, ShieldAlert, Eye, RotateCcw, Search, Calendar, User } from 'lucide-react';

export default function AuditLogsPage() {
  const { user } = useAuth();
  const { error } = useToast();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // State
  const [logs, setLogs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  // Filters
  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  // Fetch Companies if Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      const fetchCompanies = async () => {
        try {
          const res = await api.get('/company');
          setCompanies(res.data?.data?.companies || res.data?.companies || []);
        } catch (err) {
          error('Failed to load companies for filtering.');
        }
      };
      fetchCompanies();
    }
  }, [isSuperAdmin]);

  // Fetch Logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        module: filterModule || undefined,
        action: filterAction || undefined,
        user: filterUser || undefined,
        company: isSuperAdmin ? (filterCompany || undefined) : undefined,
      };

      const res = await auditLogApi.getAll(params);
      const data = res.data?.data || res.data;
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filterModule, filterAction, filterCompany]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleReset = () => {
    setFilterModule('');
    setFilterAction('');
    setFilterUser('');
    setFilterCompany('');
    setPage(1);
  };

  // Helper for action colors
  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'CREATE':
        return 'badge-success';
      case 'UPDATE':
        return 'badge-info';
      case 'DELETE':
      case 'REJECT':
      case 'CANCEL':
        return 'badge-danger';
      case 'APPROVE':
      case 'GENERATE':
        return 'badge-success';
      case 'LOGIN':
      case 'LOGOUT':
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isSuperAdmin ? 'Platform Audit Logs' : 'System Audit Logs'}
          </h1>
          <p className="page-subtitle">
            {isSuperAdmin
              ? 'Monitor system-wide company actions, security events, and administrative changes'
              : 'Track configuration changes, employee actions, and security details within your company'}
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="card-padded" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
          {isSuperAdmin && (
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Filter by Company</label>
              <select
                className="input-field"
                value={filterCompany}
                onChange={e => { setFilterCompany(e.target.value); setPage(1); }}
                style={{ width: '100%' }}
              >
                <option value="">All Companies</option>
                {companies.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Module</label>
            <select
              className="input-field"
              value={filterModule}
              onChange={e => { setFilterModule(e.target.value); setPage(1); }}
              style={{ width: '100%' }}
            >
              <option value="">All Modules</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="DEPARTMENT">Department</option>
              <option value="SHIFT">Shift</option>
              <option value="ATTENDANCE">Attendance</option>
              <option value="LEAVE">Leave</option>
              <option value="PAYROLL">Payroll</option>
              <option value="DOCUMENT">Document</option>
              <option value="RECRUITMENT">Interviews</option>
              <option value="COMPANY">Company</option>
              <option value="USER">User</option>
            </select>
          </div>

          <div>
            <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Action</label>
            <select
              className="input-field"
              value={filterAction}
              onChange={e => { setFilterAction(e.target.value); setPage(1); }}
              style={{ width: '100%' }}
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="APPROVE">Approve</option>
              <option value="REJECT">Reject</option>
              <option value="CANCEL">Cancel</option>
              <option value="GENERATE">Generate</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
          </div>

          <div>
            <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>User ID</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="User Object ID..."
                value={filterUser}
                onChange={e => setFilterUser(e.target.value)}
                style={{ width: '100%', height: '38px' }}
              />
              <Button type="submit" style={{ height: '38px', padding: '0 12px' }}>
                <Search size={15} />
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              style={{ width: '100%', height: '38px', gap: '6px' }}
            >
              <RotateCcw size={14} /> Reset
            </Button>
          </div>
        </form>
      </Card>

      {/* Logs Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Spinner />
        </div>
      ) : logs.length === 0 ? (
        <Card className="card-padded" style={{ textAlign: 'center', padding: '40px' }}>
          <ShieldAlert size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No audit logs matched the filters.</p>
        </Card>
      ) : (
        <Card style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {isSuperAdmin && <th>Company</th>}
                <th>User</th>
                <th>Action</th>
                <th>Module</th>
                <th>Description</th>
                <th>Date & Time</th>
                <th style={{ textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  {isSuperAdmin && (
                    <td style={{ fontWeight: 600 }}>
                      {log.company?.name || <span style={{ color: 'var(--text-muted)' }}>System</span>}
                    </td>
                  )}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>
                        {log.user?.name || 'Unknown User'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {log.user?.email || 'N/A'} ({log.user?.role || 'N/A'})
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getActionBadgeClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.module}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {log.description}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedLog(log)}
                      style={{ padding: '4px 8px', height: '28px', minWidth: 'unset', gap: '4px' }}
                    >
                      <Eye size={13} /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </Card>
      )}

      {/* Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="Audit Log Details"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div>
                <strong>Who:</strong> {selectedLog.user?.name} ({selectedLog.user?.email})
              </div>
              <div>
                <strong>IP Address:</strong> {selectedLog.ipAddress || 'N/A'}
              </div>
              <div>
                <strong>Action:</strong> <span className={`badge ${getActionBadgeClass(selectedLog.action)}`}>{selectedLog.action}</span>
              </div>
              <div>
                <strong>User Agent:</strong> <span style={{ fontSize: '11px', wordBreak: 'break-all' }}>{selectedLog.userAgent || 'N/A'}</span>
              </div>
              <div>
                <strong>Module:</strong> {selectedLog.module}
              </div>
              <div>
                <strong>Timestamp:</strong> {new Date(selectedLog.createdAt).toLocaleString()}
              </div>
            </div>

            <div>
              <strong>Description:</strong>
              <p style={{ background: 'var(--bg-inset)', padding: '10px', borderRadius: '8px', marginTop: '4px', marginBottom: 0 }}>
                {selectedLog.description}
              </p>
            </div>

            {selectedLog.newData && (
              <div>
                <strong>New Data Payload:</strong>
                <pre style={{ background: 'var(--bg-inset)', padding: '10px', borderRadius: '8px', overflowX: 'auto', fontSize: '11px', marginTop: '4px', color: 'var(--text-primary)' }}>
                  {JSON.stringify(selectedLog.newData, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.oldData && (
              <div>
                <strong>Old Data Payload:</strong>
                <pre style={{ background: 'var(--bg-inset)', padding: '10px', borderRadius: '8px', overflowX: 'auto', fontSize: '11px', marginTop: '4px', color: 'var(--text-primary)' }}>
                  {JSON.stringify(selectedLog.oldData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
