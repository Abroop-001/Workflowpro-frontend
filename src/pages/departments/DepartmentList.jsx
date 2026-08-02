import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { departmentApi } from '../../api/departments';
import { employeeApi } from '../../api/employees';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

export default function DepartmentList() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    departmentCode: '',
    description: '',
    manager: '',
    status: 'ACTIVE'
  });

  // Fetch departments & employees (to populate manager selection)
  const { 
  data: departmentsResponse, 
  loading: loadingDepts, 
  error: errorDepts, 
  refetch: refetchDepts 
} = useFetch(departmentApi.getAll);

const { data: employeesResponse } = useFetch(employeeApi.getAll);

const departments = departmentsResponse?.departments || [];
const employees = employeesResponse?.employees || [];

  const resetForm = () => {
    setForm({
      name: '',
      departmentCode: '',
      description: '',
      manager: '',
      status: 'ACTIVE'
    });
    setSelectedDept(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setSelectedDept(dept);
    setForm({
      name: dept.name,
      departmentCode: dept.departmentCode,
      description: dept.description || '',
      manager: dept.manager?._id || dept.manager || '',
      status: dept.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this department?')) return;
    try {
      await departmentApi.deactivate(id);
      success('Department deactivated successfully.');
      refetchDepts();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to deactivate department.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.departmentCode) {
      error('Name and Department Code are required.');
      return;
    }

    const payload = {
      name: form.name,
      departmentCode: form.departmentCode.toUpperCase(),
      description: form.description,
      manager: form.manager || null,
      status: form.status
    };

    setSaving(true);
    try {
      if (selectedDept) {
        await departmentApi.update(selectedDept._id, payload);
        success('Department updated successfully!');
      } else {
        await departmentApi.create(payload);
        success('Department created successfully!');
      }
      setIsModalOpen(false);
      refetchDepts();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setSaving(false);
    }
  };

  const filteredDepts = (departments || []).filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.departmentCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'COMPANY_ADMIN';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">Configure company branches, structure and manager roles</p>
        </div>
        {isHrOrAdmin && (
          <Button onClick={handleOpenAdd} className="btn-primary" style={{ gap: '6px' }}>
            <Plus size={15} /> Create Department
          </Button>
        )}
      </div>

      <Card className="card-padded" style={{ marginBottom: '20px' }}>
        <div className="search-bar" style={{ maxWidth: '400px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by name or code..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {loadingDepts ? (
        <Loading />
      ) : errorDepts ? (
        <ErrorState message={errorDepts} onRetry={refetchDepts} />
      ) : filteredDepts.length === 0 ? (
        <Card className="card-padded">
          <EmptyState title="No departments found" description="Create a department branch to get started." />
        </Card>
      ) : (
        <Card style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepts.map(dept => (
                <tr key={dept._id}>
                  <td style={{ fontWeight: 600 }}>{dept.departmentCode}</td>
                  <td>{dept.name}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {dept.description || '—'}
                  </td>
                  <td>
                    {dept.manager?.personalInfo 
                      ? `${dept.manager.personalInfo.firstName} ${dept.manager.personalInfo.lastName || ''}` 
                      : '—'}
                  </td>
                  <td>
                    <StatusBadge status={dept.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isHrOrAdmin && (
                        <button onClick={() => handleOpenEdit(dept)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                          <Edit size={14} />
                        </button>
                      )}
                      {user?.role === 'COMPANY_ADMIN' && dept.status !== 'INACTIVE' && (
                        <button onClick={() => handleDelete(dept._id)} className="btn btn-danger btn-sm" style={{ padding: '6px' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDept ? 'Edit Department' : 'Create Department'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input 
            label="Department Code (Capital letters, e.g. TECH, HR)" 
            placeholder="e.g. TECH" 
            required
            value={form.departmentCode}
            onChange={e => setForm(prev => ({ ...prev, departmentCode: e.target.value }))}
            disabled={!!selectedDept}
          />
          <Input 
            label="Department Name" 
            placeholder="e.g. Technology" 
            required
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
          />
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-input" 
              rows={3} 
              placeholder="Provide a brief summary of the branch activities..." 
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department Manager</label>
            <select 
              className="form-input form-select"
              value={form.manager}
              onChange={e => setForm(prev => ({ ...prev, manager: e.target.value }))}
            >
              <option value="">No Manager Assigned</option>
              {employees && employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.personalInfo?.firstName} {emp.personalInfo?.lastName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              className="form-input form-select"
              value={form.status}
              onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Branch</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
