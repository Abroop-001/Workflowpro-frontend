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
        <div>
          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Input
                placeholder="Search by company name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>
              {companies.length} {companies.length === 1 ? 'company' : 'companies'}
            </div>
          </div>

          {/* Loading State */}
          {fetchCompaniesApi.loading && companies.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '80px 20px', background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <Spinner />
              <p style={{ color: 'var(--text-muted)', marginTop: '16px', fontSize: '14px' }}>Loading companies...</p>
            </div>

          /* Empty State */
          ) : companies.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '80px 20px', background: 'var(--surface)', border: '1px dashed var(--border-strong)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: 'rgba(201, 168, 106, 0.08)', border: '1px solid rgba(201, 168, 106, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
              }}>
                <Building size={28} style={{ color: '#C9A86A', opacity: 0.6 }} />
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '15px', fontWeight: 500 }}>No companies registered yet</p>
              <p style={{ color: 'var(--text-muted)', margin: '6px 0 0', fontSize: '13px' }}>Create your first company tenant to get started.</p>
            </div>

          /* Company Card Grid */
          ) : (
            <div className="sa-company-grid">
              {companies.map((company) => {
                const isActive = company.status !== 'SUSPENDED';
                const isSelected = selectedCompany?._id === company._id;
                const initials = (company.name || '??').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

                return (
                  <div
                    key={company._id}
                    className={`sa-company-card ${isSelected ? 'sa-company-card--selected' : ''}`}
                    onClick={() => handleSelectCompany(company)}
                  >
                    {/* Card Header */}
                    <div className="sa-company-card__header">
                      <div className="sa-company-card__avatar">
                        {initials}
                      </div>
                      <div className="sa-company-card__title-group">
                        <h3 className="sa-company-card__name">{company.name}</h3>
                        <p className="sa-company-card__domain">{company.domain || 'No domain'}</p>
                      </div>
                      <span className={`sa-status-badge ${isActive ? 'sa-status-badge--active' : 'sa-status-badge--suspended'}`}>
                        <span className="sa-status-badge__dot" />
                        {isActive ? 'Active' : 'Suspended'}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="sa-company-card__body">
                      <div className="sa-company-card__info-row">
                        <span className="sa-company-card__info-label">Email</span>
                        <span className="sa-company-card__info-value">{company.email}</span>
                      </div>
                      <div className="sa-company-card__info-row">
                        <span className="sa-company-card__info-label">Phone</span>
                        <span className="sa-company-card__info-value">{company.phone || '—'}</span>
                      </div>
                      <div className="sa-company-card__info-row">
                        <span className="sa-company-card__info-label">Address</span>
                        <span className="sa-company-card__info-value">
                          {typeof company.address === 'string'
                            ? (company.address || '—')
                            : company.address
                              ? `${company.address.street || ''}, ${company.address.city || ''}`
                              : '—'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="sa-company-card__footer" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectCompany(company)}
                        style={{ flex: 1 }}
                      >
                        <Edit3 size={13} /> Details
                      </Button>
                      <Button
                        variant={isActive ? 'danger' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleStatus(company)}
                        style={{ flex: 1 }}
                      >
                        {isActive ? <><PowerOff size={13} /> Suspend</> : <><Power size={13} /> Activate</>}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Details & Edit Panel (below grid) */}
          {selectedCompany && (
            <Card className="card-padded-lg" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="sa-company-card__avatar" style={{ width: '36px', height: '36px', fontSize: '13px' }}>
                    {(selectedCompany.name || '??').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                      {selectedCompany.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Company Details</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`sa-status-badge ${selectedCompany.status === 'SUSPENDED' ? 'sa-status-badge--suspended' : 'sa-status-badge--active'}`}>
                    <span className="sa-status-badge__dot" />
                    {selectedCompany.status || 'ACTIVE'}
                  </span>
                  <button
                    onClick={() => { setSelectedCompany(null); setIsEditing(false); }}
                    style={{
                      background: 'transparent', border: 'none', color: 'var(--text-muted)',
                      cursor: 'pointer', fontSize: '18px', padding: '2px 6px', lineHeight: 1
                    }}
                    title="Close"
                  >
                    ×
                  </button>
                </div>
              </div>

              {!isEditing ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div className="detail-field">
                      <span className="detail-label">Name</span>
                      <span className="detail-value">{selectedCompany.name}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{selectedCompany.email}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{selectedCompany.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Domain</span>
                      <span className="detail-value">{selectedCompany.domain || 'N/A'}</span>
                    </div>
                    <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
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
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit3 size={14} /> Edit Profile
                    </Button>
                    <Button 
                      variant={selectedCompany.status === 'SUSPENDED' ? 'primary' : 'danger'}
                      onClick={() => handleToggleStatus(selectedCompany)}
                    >
                      {selectedCompany.status === 'SUSPENDED' ? <><Power size={14} /> Activate Tenant</> : <><PowerOff size={14} /> Suspend Tenant</>}
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
                    <Button type="submit" loading={updateCompanyApi.loading}>
                      Save Changes
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
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
