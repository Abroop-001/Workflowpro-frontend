import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useFetch } from '../../hooks/useFetch';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { documentApi } from '../../api/documents';
import { employeeApi } from '../../api/employees';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { File, Plus, Download, Trash2, CheckCircle2, XCircle, Search, Calendar, Folder } from 'lucide-react';

export default function DocumentsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const isAdminOrHr = ['COMPANY_ADMIN', 'HR'].includes(user?.role);
  const isEmployee = user?.role === 'EMPLOYEE';

  // Tabs for Admin/HR
  const [activeTab, setActiveTab] = useState('employees'); // 'employees', 'pending', 'expiring'

  // Document states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employeeDocs, setEmployeeDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Upload/Edit Form state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'IDENTITY',
    description: '',
    expiryDate: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  // Verification modal state
  const [verifyingDoc, setVerifyingDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Fetch employees & lists
  const { data: employeesResponse } = useFetch(
  () => isAdminOrHr
    ? employeeApi.getAll({ status: "ACTIVE" })
    : Promise.resolve({ employees: [] })
);

const employees = Array.isArray(employeesResponse)
  ? employeesResponse
  : employeesResponse?.employees || [];
  const { data: pendingDocs, refetch: refetchPending } = useFetch(() => isAdminOrHr ? api.get('/documents/reports/pending') : Promise.resolve([]));
  const { data: expiringDocs, refetch: refetchExpiring } = useFetch(() => isAdminOrHr ? api.get('/documents/reports/expiring') : Promise.resolve([]));

  // Employee self docs
  const { data: selfDocs, loading: selfLoading, error: selfErr, refetch: refetchSelf } = useFetch(
    () => isEmployee ? api.get('/self-service/documents') : Promise.resolve([]),
    null,
    [user]
  );

  // Load documents for selected employee
  const loadEmployeeDocs = async (empId) => {
    if (!empId) {
      setEmployeeDocs([]);
      return;
    }
    setLoadingDocs(true);
    try {
      const res = await documentApi.getEmployeeDocs(empId);
      setEmployeeDocs(res.data?.data?.documents || res.data?.documents || []);
    } catch (err) {
      error('Failed to load employee documents.');
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (isAdminOrHr && selectedEmployeeId) {
      loadEmployeeDocs(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const handleDownload = async (docId, filename) => {
    try {
      const res = await documentApi.download(docId);
      const blob = new Blob([res.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename || `document-${docId}`;
      link.click();
      success('File downloaded successfully!');
    } catch (err) {
      error('Failed to download document.');
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentApi.delete(docId);
      success('Document deleted successfully!');
      if (selectedEmployeeId) loadEmployeeDocs(selectedEmployeeId);
      refetchPending();
      refetchExpiring();
    } catch (err) {
      error('Failed to delete document.');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title || !selectedEmployeeId) {
      error('Please select an employee, enter a title, and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('employee', selectedEmployeeId);
    formData.append('title', uploadForm.title);
    formData.append('category', uploadForm.category);
    formData.append('description', uploadForm.description);
    if (uploadForm.expiryDate) {
      formData.append('expiryDate', uploadForm.expiryDate);
    }
    formData.append('document', uploadForm.file);

    setUploading(true);
    try {
      await documentApi.upload(formData);
      success('Document uploaded successfully!');
      setIsUploadModalOpen(false);
      setUploadForm({ title: '', category: 'IDENTITY', description: '', expiryDate: '', file: null });
      loadEmployeeDocs(selectedEmployeeId);
      refetchPending();
      refetchExpiring();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (status) => {
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      error('Please provide a reason for rejection.');
      return;
    }
    setVerifying(true);
    try {
      await api.patch(`/documents/${verifyingDoc._id}/verify`, { status, rejectionReason });
      success(`Document status updated to ${status}.`);
      setVerifyingDoc(null);
      setRejectionReason('');
      if (selectedEmployeeId) loadEmployeeDocs(selectedEmployeeId);
      refetchPending();
    } catch (err) {
      error('Failed to update verification status.');
    } finally {
      setVerifying(false);
    }
  };

  if (isEmployee) {
    if (selfLoading) return <Loading />;
    if (selfErr) return <ErrorState message={selfErr} onRetry={refetchSelf} />;
    const list = selfDocs?.documents || selfDocs || [];
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">My Documents</h1>
            <p className="page-subtitle">View and download your official documents</p>
          </div>
        </div>
        {list.length === 0 ? (
          <Card className="card-padded"><EmptyState title="No documents found" description="No documents have been uploaded for you." /></Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {list.map(doc => (
              <Card key={doc._id} className="card-padded" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Folder className="text-accent" size={24} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>{doc.category}</p>
                  </div>
                </div>
                <div><StatusBadge status={doc.verificationStatus} /></div>
                {doc.rejectionReason && (
                  <p style={{ fontSize: '11px', color: 'var(--danger)', margin: 0 }}>Reason: {doc.rejectionReason}</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Expiry: {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'None'}</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(doc._id, doc.file?.originalName)}>
                    <Download size={12} /> Download
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Admin / HR View
  const activePendingList = pendingDocs?.documents || pendingDocs || [];
  const activeExpiringList = expiringDocs?.documents || expiringDocs || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Management</h1>
          <p className="page-subtitle">Manage, verify, and track company and employee compliance files</p>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>
          Employee Files
        </button>
        <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          Pending Review ({activePendingList.length})
        </button>
        <button className={`tab-btn ${activeTab === 'expiring' ? 'active' : ''}`} onClick={() => setActiveTab('expiring')}>
          Expiring Documents ({activeExpiringList.length})
        </button>
      </div>

      {activeTab === 'employees' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:grid-cols-3">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card className="card-padded">
              <h3 style={{ fontSize: '14.5px', fontWeight: 600, marginBottom: '14px' }}>Select Employee</h3>
              <select
                value={selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(e.target.value)}
                className="input-field"
                style={{ width: '100%' }}
              >
                <option value="">-- Choose Employee --</option>
                {employees?.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.personalInfo?.firstName} {emp.personalInfo?.lastName} ({emp.employeeId})
                  </option>
                ))}
              </select>

              {selectedEmployeeId && (
                <Button 
                  onClick={() => setIsUploadModalOpen(true)} 
                  style={{ width: '100%', marginTop: '16px', gap: '8px' }}
                >
                  <Plus size={15} /> Upload Document
                </Button>
              )}
            </Card>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            {!selectedEmployeeId ? (
              <Card className="card-padded" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Folder size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: '13.5px', margin: 0 }}>Please select an employee from the list to view and manage their documents.</p>
              </Card>
            ) : loadingDocs ? (
              <Loading />
            ) : employeeDocs.length === 0 ? (
              <Card className="card-padded"><EmptyState title="No documents found" description="No documents uploaded for this employee yet." /></Card>
            ) : (
              <Card>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Expiry</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeDocs.map(doc => (
                      <tr key={doc._id}>
                        <td style={{ fontWeight: 600 }}>{doc.title}</td>
                        <td>{doc.category}</td>
                        <td><StatusBadge status={doc.verificationStatus} /></td>
                        <td>{doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'None'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {doc.verificationStatus === 'PENDING' && (
                              <Button 
                                variant="secondary" 
                                onClick={() => setVerifyingDoc(doc)} 
                                style={{ padding: '4px 8px', height: '28px', minWidth: 'unset' }}
                              >
                                Review
                              </Button>
                            )}
                            <Button 
                              variant="secondary" 
                              onClick={() => handleDownload(doc._id, doc.file?.originalName)} 
                              style={{ padding: '4px', height: '28px', minWidth: 'unset' }}
                            >
                              <Download size={13} />
                            </Button>
                            <Button 
                              variant="danger" 
                              onClick={() => handleDelete(doc._id)} 
                              style={{ padding: '4px', height: '28px', minWidth: 'unset' }}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <Card>
          {activePendingList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><p style={{ color: 'var(--text-secondary)', margin: 0 }}>No pending documents for review.</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Uploaded Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activePendingList.map(doc => {
                  const empName = doc.employee
                    ? `${doc.employee.personalInfo?.firstName || ''} ${doc.employee.personalInfo?.lastName || ''}`
                    : 'Employee';
                  return (
                    <tr key={doc._id}>
                      <td style={{ fontWeight: 600 }}>{empName}</td>
                      <td>{doc.title}</td>
                      <td>{doc.category}</td>
                      <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button variant="secondary" onClick={() => setVerifyingDoc(doc)} style={{ padding: '4px 8px', height: '28px', minWidth: 'unset' }}>
                            Verify / Reject
                          </Button>
                          <Button variant="secondary" onClick={() => handleDownload(doc._id, doc.file?.originalName)} style={{ padding: '4px', height: '28px', minWidth: 'unset' }}>
                            <Download size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {activeTab === 'expiring' && (
        <Card>
          {activeExpiringList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><p style={{ color: 'var(--text-secondary)', margin: 0 }}>No expiring documents found.</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Expiry Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeExpiringList.map(doc => {
                  const empName = doc.employee
                    ? `${doc.employee.personalInfo?.firstName || ''} ${doc.employee.personalInfo?.lastName || ''}`
                    : 'Employee';
                  return (
                    <tr key={doc._id}>
                      <td style={{ fontWeight: 600 }}>{empName}</td>
                      <td>{doc.title}</td>
                      <td>{doc.category}</td>
                      <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{new Date(doc.expiryDate).toLocaleDateString()}</td>
                      <td>
                        <Button variant="secondary" onClick={() => handleDownload(doc._id, doc.file?.originalName)} style={{ padding: '4px', height: '28px', minWidth: 'unset' }}>
                          <Download size={13} /> Download
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Employee Document">
        <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
          <Input
            label="Document Title"
            placeholder="e.g. Passport, Offer Letter"
            required
            value={uploadForm.title}
            onChange={e => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
          />
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={uploadForm.category}
              onChange={e => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
              className="input-field"
              style={{ width: '100%' }}
            >
              <option value="IDENTITY">Identity Verification</option>
              <option value="EDUCATION">Education Certificates</option>
              <option value="EXPERIENCE">Experience Letters</option>
              <option value="CONTRACT">Employment Contract</option>
              <option value="OFFER_LETTER">Offer Letter</option>
              <option value="SALARY">Salary Statement</option>
              <option value="CERTIFICATE">Certificates / Achievements</option>
              <option value="OTHER">Other Documents</option>
            </select>
          </div>
          <Input
            label="Description"
            placeholder="Provide optional document notes..."
            value={uploadForm.description}
            onChange={e => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
          />
          <Input
            label="Expiry Date"
            type="date"
            value={uploadForm.expiryDate}
            onChange={e => setUploadForm(prev => ({ ...prev, expiryDate: e.target.value }))}
          />
          <div className="form-group">
            <label className="form-label">Document File (PDF, Word, or Image)</label>
            <input 
              type="file" 
              className="input-field" 
              required
              onChange={e => setUploadForm(prev => ({ ...prev, file: e.target.files[0] }))}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={uploading}>Upload File</Button>
          </div>
        </form>
      </Modal>

      {/* Verify / Reject Modal */}
      {verifyingDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <Card className="card-padded-lg" style={{ width: '450px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Review Document Verification</h3>
            <p style={{ fontSize: '13.5px', marginBottom: '16px' }}>
              <strong>Document:</strong> {verifyingDoc.title} ({verifyingDoc.category})
            </p>
            <div className="flex flex-col gap-4">
              <Input
                label="Rejection Reason (Required if Rejecting)"
                placeholder="e.g. Incorrect file uploaded, Blurred information..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Button onClick={() => handleVerify('VERIFIED')} loading={verifying} variant="success" style={{ flex: 1 }}>
                  Verify
                </Button>
                <Button onClick={() => handleVerify('REJECTED')} loading={verifying} variant="danger" style={{ flex: 1 }}>
                  Reject
                </Button>
                <Button type="button" variant="secondary" onClick={() => { setVerifyingDoc(null); setRejectionReason(''); }} style={{ flex: 1 }}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
