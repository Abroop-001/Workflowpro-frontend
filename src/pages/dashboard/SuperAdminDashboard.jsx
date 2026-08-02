import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { Building, Plus, Search, Filter, Edit3, Power, PowerOff, Shield, Activity, CheckCircle2 } from 'lucide-react';

export default function SuperAdminDashboard() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('directory');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companies, setCompanies] = useState([]);
  
  // Edit & Details state
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', email: '', phone: '', address: '', domain: ''
  });

  // States for creating company
  const [newCompany, setNewCompany] = useState({
    name: '', email: '', phone: '', address: '', domain: ''
  });

  // APIs
  const fetchCompaniesApi = useApi((params) => api.get('/company', { params }));
  const createCompanyApi = useApi((data) => api.post('/company', data));
  const updateCompanyApi = useApi((id, data) => api.patch(`/company/${id}`, data));
  const deactivateCompanyApi = useApi((id) => api.patch(`/company/${id}/deactivate`));
  const activateCompanyApi = useApi((id) => api.patch(`/company/${id}/activate`));

  // Load companies
  const loadCompanies = async () => {
    try {
      const res = await fetchCompaniesApi.execute({
        search: searchQuery,
        status: statusFilter
      });
      setCompanies(res.data?.data?.companies || res.data?.companies || res.companies || []);
    } catch (err) {
      console.error(err);
      error('Failed to load companies');
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [searchQuery, statusFilter]);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.email) {
      error('Please fill in Name and Email.');
      return;
    }
    try {
      await createCompanyApi.execute(newCompany);
      success('Company created successfully!');
      setNewCompany({ name: '', email: '', phone: '', address: '', domain: '' });
      setActiveTab('directory');
      loadCompanies();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create company.');
    }
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setIsEditing(false);
    setEditForm({
      name: company.name || '',
      email: company.email || '',
      phone: company.phone || '',
      address: typeof company.address === 'string' ? company.address : company.address?.street || '',
      domain: company.domain || ''
    });
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;
    try {
      const res = await updateCompanyApi.execute(selectedCompany._id, editForm);
      success('Company updated successfully!');
      setIsEditing(false);
      loadCompanies();
      setSelectedCompany(res.data?.data?.company || res.data?.company || res.company || { ...selectedCompany, ...editForm });
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update company.');
    }
  };

  const handleToggleStatus = async (company) => {
    const isSuspended = company.status === 'SUSPENDED';
    const actionText = isSuspended ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionText} this company?`)) return;

    try {
      let res;
      if (isSuspended) {
        res = await activateCompanyApi.execute(company._id);
        success('Company activated successfully!');
      } else {
        res = await deactivateCompanyApi.execute(company._id);
        success('Company suspended successfully!');
      }
      loadCompanies();
      const updatedCompany = res.data?.data?.company || res.data?.company || res.company || { ...company, status: isSuspended ? 'ACTIVE' : 'SUSPENDED' };
      if (selectedCompany && selectedCompany._id === company._id) {
        setSelectedCompany(updatedCompany);
      }
    } catch (err) {
      error(`Failed to ${actionText} company.`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Super Admin Dashboard</h1>
          <p className="page-subtitle">SaaS platform configuration and company directory management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('directory')}
        >
          Company Directory
        </button>
        <button 
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Register Company
        </button>
      </div>

      {activeTab === 'directory' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedCompany ? '3fr 2fr' : '1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Company Listing list */}
          <Card className="card-padded-lg">
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <Input
                  placeholder="Search by company name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              </div>
              <div style={{ width: '180px' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                  style={{ height: '38px' }}
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            {fetchCompaniesApi.loading && companies.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Spinner />
              </div>
            ) : companies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <Building size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ margin: 0 }}>No companies registered yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Email</th>
                      <th>Domain</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr 
                        key={company._id} 
                        style={{ cursor: 'pointer', background: selectedCompany?._id === company._id ? 'var(--bg-hover)' : 'transparent' }}
                        onClick={() => handleSelectCompany(company)}
                      >
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{company.name}</td>
                        <td>{company.email}</td>
                        <td>{company.domain || 'N/A'}</td>
                        <td>
                          <span className={`badge ${company.status === 'SUSPENDED' ? 'badge-danger' : 'badge-success'}`}>
                            {company.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <Button 
                              variant="secondary" 
                              style={{ padding: '4px 8px', minWidth: 'unset', height: '28px' }} 
                              onClick={() => handleSelectCompany(company)}
                            >
                              <Edit3 size={13} />
                            </Button>
                            <Button 
                              variant={company.status === 'SUSPENDED' ? 'success' : 'danger'}
                              style={{ padding: '4px 8px', minWidth: 'unset', height: '28px' }} 
                              onClick={() => handleToggleStatus(company)}
                            >
                              {company.status === 'SUSPENDED' ? <Power size={13} /> : <PowerOff size={13} />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Details & Edit Panel */}
          {selectedCompany && (
            <Card className="card-padded-lg" style={{ position: 'sticky', top: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Company details</h3>
                <span className={`badge ${selectedCompany.status === 'SUSPENDED' ? 'badge-danger' : 'badge-success'}`}>
                  {selectedCompany.status || 'ACTIVE'}
                </span>
              </div>

              {!isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="detail-field">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{selectedCompany.name}</span>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedCompany.email}</span>
                  </div>
                  <div className="form-grid">
                    <div className="detail-field">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{selectedCompany.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Domain</span>
                      <span className="detail-value">{selectedCompany.domain || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="detail-field">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">
                      {typeof selectedCompany.address === 'string' 
                        ? selectedCompany.address 
                        : selectedCompany.address 
                          ? `${selectedCompany.address.street || ''}, ${selectedCompany.address.city || ''}, ${selectedCompany.address.state || ''}`
                          : 'N/A'
                      }
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <Button onClick={() => setIsEditing(true)} style={{ flex: 1 }}>
                      Edit Profile
                    </Button>
                    <Button 
                      variant={selectedCompany.status === 'SUSPENDED' ? 'success' : 'danger'}
                      onClick={() => handleToggleStatus(selectedCompany)}
                      style={{ flex: 1 }}
                    >
                      {selectedCompany.status === 'SUSPENDED' ? 'Activate Tenant' : 'Suspend Tenant'}
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateCompany} className="flex flex-col gap-4">
                  <Input 
                    label="Company Name" 
                    value={editForm.name} 
                    required
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} 
                  />
                  <Input 
                    label="Email Address" 
                    value={editForm.email} 
                    required
                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))} 
                  />
                  <div className="form-grid">
                    <Input 
                      label="Phone" 
                      value={editForm.phone} 
                      onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))} 
                    />
                    <Input 
                      label="Domain" 
                      value={editForm.domain} 
                      onChange={e => setEditForm(prev => ({ ...prev, domain: e.target.value }))} 
                    />
                  </div>
                  <Input 
                    label="Address" 
                    value={editForm.address} 
                    onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))} 
                  />

                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <Button type="submit" loading={updateCompanyApi.loading} style={{ flex: 1 }}>
                      Save Changes
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <Card className="card-padded-lg" style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Register a New Company tenant</h2>
          <form onSubmit={handleCreateCompany} className="flex flex-col gap-4">
            <Input 
              label="Company Name" 
              placeholder="e.g. Acme Corp" 
              required
              value={newCompany.name} 
              onChange={e => setNewCompany(prev => ({ ...prev, name: e.target.value }))} 
            />
            <Input 
              label="Official Email Address" 
              type="email"
              placeholder="e.g. contact@acme.com" 
              required
              value={newCompany.email} 
              onChange={e => setNewCompany(prev => ({ ...prev, email: e.target.value }))} 
            />
            <div className="form-grid">
              <Input 
                label="Phone" 
                placeholder="+1 555-0199" 
                value={newCompany.phone} 
                onChange={e => setNewCompany(prev => ({ ...prev, phone: e.target.value }))} 
              />
              <Input 
                label="Domain" 
                placeholder="acme.com" 
                value={newCompany.domain} 
                onChange={e => setNewCompany(prev => ({ ...prev, domain: e.target.value }))} 
              />
            </div>
            <Input 
              label="Physical Address" 
              placeholder="123 Main St, New York, NY" 
              value={newCompany.address} 
              onChange={e => setNewCompany(prev => ({ ...prev, address: e.target.value }))} 
            />
            
            <Button type="submit" loading={createCompanyApi.loading} className="mt-2">
              <Plus size={15} /> Register Company
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
