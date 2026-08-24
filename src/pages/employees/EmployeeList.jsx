import { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { employeeApi } from '../../api/employees';
import { departmentApi } from '../../api/departments';
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
import Pagination from '../../components/ui/Pagination';
import { Search, Plus, Edit, Trash2, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmployeeList() {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [createdEmployeeCreds, setCreatedEmployeeCreds] = useState(null);
  const itemsPerPage = 8;

  // Form state
  const [form, setForm] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    designation: '',
    joiningDate: '',
    employmentType: 'FULL_TIME',
    department: '',
    salary: 0,
    status: 'ACTIVE'
  });

  // Fetch employees & departments
 const { 
  data: employeesResponse, 
  loading: loadingEmps, 
  error: errorEmps, 
  refetch: refetchEmps 
} = useFetch(
  () => employeeApi.getAll({ status: statusFilter, department: deptFilter }),
  null,
  [statusFilter, deptFilter]
);

const employees = employeesResponse?.employees || [];


const { data: departmentsResponse } = useFetch(departmentApi.getAll);

const departments = departmentsResponse?.departments || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, deptFilter]);

  const resetForm = () => {
    setForm({
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'MALE',
      designation: '',
      joiningDate: '',
      employmentType: 'FULL_TIME',
      department: '',
      salary: 0,
      status: 'ACTIVE'
    });
    setSelectedEmployee(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setForm({
      employeeId: emp.employeeId,
      firstName: emp.personalInfo?.firstName || '',
      lastName: emp.personalInfo?.lastName || '',
      email: emp.personalInfo?.email || '',
      phone: emp.personalInfo?.phone || '',
      dateOfBirth: emp.personalInfo?.dateOfBirth ? emp.personalInfo.dateOfBirth.substring(0, 10) : '',
      gender: emp.personalInfo?.gender || 'MALE',
      designation: emp.jobInfo?.designation || '',
      joiningDate: emp.jobInfo?.joiningDate ? emp.jobInfo.joiningDate.substring(0, 10) : '',
      employmentType: emp.jobInfo?.employmentType || 'FULL_TIME',
      department: emp.department?._id || emp.department || '',
      salary: emp.salary || 0,
      status: emp.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate and remove this employee?')) return;
    try {
      await employeeApi.deactivate(id);
      success('Employee deactivated successfully.');
      refetchEmps();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to deactivate employee.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.firstName) {
      error('Employee ID and First Name are required.');
      return;
    }
    
    // Prepare payload
    const payload = {
      employeeId: form.employeeId,
      personalInfo: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender
      },
      jobInfo: {
        designation: form.designation,
        joiningDate: form.joiningDate || undefined,
        employmentType: form.employmentType
      },
      department: form.department || null,
      salary: Number(form.salary),
      status: form.status
    };

    setSaving(true);
    try {
      if (selectedEmployee) {
        // Edit mode (Note: Backend update validation rejects company and employeeId changing)
        await employeeApi.update(selectedEmployee._id, payload);
        success('Employee details updated successfully!');
      } else {
        // Create mode
        const response = await employeeApi.create(payload);
        const resData = response.data?.data ?? response.data;
        if (resData?.temporaryPassword) {
          setCreatedEmployeeCreds({
            email: form.email,
            temporaryPassword: resData.temporaryPassword
          });
        }
        success('Employee created successfully!');
      }
      setIsModalOpen(false);
      refetchEmps();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save employee.');
    } finally {
      setSaving(false);
    }
  };

  // Filter local search
  const filteredEmployees = (employees || []).filter(emp => {
    const fullName = `${emp.personalInfo?.firstName || ''} ${emp.personalInfo?.lastName || ''}`.toLowerCase();
    const idStr = (emp.employeeId || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || idStr.includes(query);
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'COMPANY_ADMIN';

  if (user?.role === 'EMPLOYEE') {
    return (
      <Card className="card-padded" style={{ margin: '20px auto', maxWidth: '600px' }}>
        <EmptyState title="Access Denied" description="You do not have permission to access the employee directory." />
      </Card>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees Directory</h1>
          <p className="page-subtitle">View list and manage profiles of company members</p>
        </div>
        {isHrOrAdmin && (
          <Button onClick={handleOpenAdd} className="btn-primary" style={{ gap: '6px' }}>
            <Plus size={15} /> Add Employee
          </Button>
        )}
      </div>

      {/* Filter / Search bar */}
      <Card className="card-padded" style={{ marginBottom: '20px' }}>
        <div className="filter-bar" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by name or Employee ID..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              className="form-input form-select" 
              style={{ width: '160px' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated</option>
            </select>

            <select 
              className="form-input form-select" 
              style={{ width: '180px' }}
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments && departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      {loadingEmps ? (
        <Loading />
      ) : errorEmps ? (
        <ErrorState message={errorEmps} onRetry={refetchEmps} />
      ) : filteredEmployees.length === 0 ? (
        <Card className="card-padded">
          <EmptyState title="No employees found" description="Try refining your search terms or filter criteria." />
        </Card>
      ) : (
        <Card style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map(emp => (
                <tr key={emp._id}>
                  <td style={{ fontWeight: 600 }}>{emp.employeeId}</td>
                  <td>
                    {emp.personalInfo?.firstName} {emp.personalInfo?.lastName}
                  </td>
                  <td>{emp.personalInfo?.email || '—'}</td>
                  <td>{emp.department?.name || emp.department || '—'}</td>
                  <td>{emp.jobInfo?.designation || '—'}</td>
                  <td>{emp.jobInfo?.joiningDate ? new Date(emp.jobInfo.joiningDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <StatusBadge status={emp.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/employees/${emp._id}`} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                        <Eye size={14} />
                      </Link>
                      {isHrOrAdmin && (
                        <>
                          <button onClick={() => handleOpenEdit(emp)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                            <Edit size={14} />
                          </button>
                          {user?.role === 'COMPANY_ADMIN' && emp.status !== 'INACTIVE' && (
                            <button onClick={() => handleDelete(emp._id)} className="btn btn-danger btn-sm" style={{ padding: '6px' }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination 
            page={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </Card>
      )}

      {/* Add / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedEmployee ? 'Edit Employee Details' : 'Add New Employee'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-grid">
            <Input 
              label="Employee ID" 
              placeholder="e.g. EMP-101" 
              required
              disabled={!!selectedEmployee}
              value={form.employeeId}
              onChange={e => setForm(prev => ({ ...prev, employeeId: e.target.value }))}
            />
            <div className="form-group">
              <label className="form-label">Department</label>
              <select 
                className="form-input form-select"
                value={form.department}
                onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))}
              >
                <option value="">No Department Assigned</option>
                {departments && departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '4px', margin: '10px 0 0 0' }}>Personal Info</h3>
          <div className="form-grid">
            <Input 
              label="First Name" 
              placeholder="John" 
              required
              value={form.firstName}
              onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
            />
            <Input 
              label="Last Name" 
              placeholder="Doe" 
              value={form.lastName}
              onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))}
            />
          </div>

          <div className="form-grid">
            <Input 
              label="Email Address" 
              type="email"
              placeholder="john.doe@company.com" 
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            />
            <Input 
              label="Phone number (10 digits)" 
              placeholder="1234567890" 
              value={form.phone}
              onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="form-grid">
            <Input 
              label="Date of Birth" 
              type="date"
              value={form.dateOfBirth}
              onChange={e => setForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            />
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select 
                className="form-input form-select"
                value={form.gender}
                onChange={e => setForm(prev => ({ ...prev, gender: e.target.value }))}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '4px', margin: '10px 0 0 0' }}>Job Info</h3>
          <div className="form-grid">
            <Input 
              label="Designation" 
              placeholder="e.g. Senior Software Engineer" 
              value={form.designation}
              onChange={e => setForm(prev => ({ ...prev, designation: e.target.value }))}
            />
            <Input 
              label="Joining Date" 
              type="date"
              value={form.joiningDate}
              onChange={e => setForm(prev => ({ ...prev, joiningDate: e.target.value }))}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Employment Type</label>
              <select 
                className="form-input form-select"
                value={form.employmentType}
                onChange={e => setForm(prev => ({ ...prev, employmentType: e.target.value }))}
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>
            <Input 
              label="Base Salary (INR)" 
              type="number"
              placeholder="0" 
              value={form.salary}
              onChange={e => setForm(prev => ({ ...prev, salary: e.target.value }))}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Employee Status</label>
              <select 
                className="form-input form-select"
                value={form.status}
                onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
            <div className="form-group"></div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save details</Button>
          </div>
        </form>
      </Modal>

      {/* Credentials Modal */}
      <Modal
        isOpen={!!createdEmployeeCreds}
        onClose={() => setCreatedEmployeeCreds(null)}
        title="Employee Account Created"
        size="md"
      >
        <div className="flex flex-col gap-4 text-gray-900">
          <p className="text-sm text-gray-600">
            The employee's account has been successfully created. Please share the temporary login credentials below with the employee. They will be prompted to change their password upon logging in.
          </p>
          
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-5 flex flex-col gap-3 font-mono text-sm text-[#D6D3CC]">
            <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-2">
              <span className="text-[#A8A6A0]">Login Email:</span>
              <span className="text-[#F3F0E8] font-semibold">{createdEmployeeCreds?.email}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[#A8A6A0]">Temp Password:</span>
              <div className="flex items-center gap-2">
                <span className="text-[#C9A86A] font-bold tracking-wider">{createdEmployeeCreds?.temporaryPassword}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(createdEmployeeCreds?.temporaryPassword);
                    success('Temporary password copied to clipboard!');
                  }}
                  className="px-2 py-1 text-xs bg-[#C9A86A] text-black font-sans font-medium rounded hover:bg-[#B89455] transition-all cursor-pointer"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <Button onClick={() => setCreatedEmployeeCreds(null)} className="btn-primary">
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
