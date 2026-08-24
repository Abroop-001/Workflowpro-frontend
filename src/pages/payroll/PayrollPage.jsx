import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { payrollApi, salaryStructureApi } from '../../api/payroll';
import { employeeApi } from '../../api/employees';
import { payslipApi } from '../../api/payslips';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { Plus, Search, DollarSign, FileText, CheckCircle, XCircle, CreditCard, ChevronRight, Download, Edit3, Trash2 } from 'lucide-react';

export default function PayrollPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [activeTab, setActiveTab] = useState('payrolls');

  // Payroll States
  const [payrolls, setPayrolls] = useState([]);
  const [payrollFilters, setPayrollFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: ''
  });
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  
  // Salary Structure States
  const [structures, setStructures] = useState([]);
  const [structureSearch, setStructureSearch] = useState('');
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);

  // Form states
  const [generateForm, setGenerateForm] = useState({
    employee: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const [structureForm, setStructureForm] = useState({
    employee: '',
    basicSalary: 0,
    allowances: {
      houseAllowance: 0,
      transportAllowance: 0,
      medicalAllowance: 0,
      otherAllowance: 0
    },
    deductions: {
      tax: 0,
      providentFund: 0,
      insurance: 0,
      otherDeduction: 0
    },
    overtimeRatePerHour: 0,
    status: 'ACTIVE'
  });

  // Pay modal states
  const [payingPayroll, setPayingPayroll] = useState(null);
  const [payForm, setPayForm] = useState({
    paymentReference: ''
  });

  // APIs
  const fetchPayrollsApi = useApi((params) => payrollApi.getAll(params));
  const generatePayrollApi = useApi((data) => payrollApi.generate(data));
  const approvePayrollApi = useApi((id) => payrollApi.approve(id));
  const markPaidApi = useApi((id, data) => payrollApi.markPaid(id, data));
  const cancelPayrollApi = useApi((id) => payrollApi.cancel(id));

  const fetchStructuresApi = useApi((params) => salaryStructureApi.getAll(params));
  const createStructureApi = useApi((data) => salaryStructureApi.create(data));
  const updateStructureApi = useApi((id, data) => salaryStructureApi.update(id, data));
  const deleteStructureApi = useApi((id) => salaryStructureApi.deactivate(id));
  
  const generatePayslipApi = useApi((data) => payslipApi.generate(data));

  // Load data
  const loadPayrolls = async () => {
    try {
      const res = await fetchPayrollsApi.execute(payrollFilters);
      setPayrolls(res.data?.data?.payrolls || res.data?.payrolls || res.payrolls || []);
    } catch (err) {
      error('Failed to load payroll list');
    }
  };

  const loadStructures = async () => {
    try {
      const res = await fetchStructuresApi.execute();
      setStructures(res.data?.data?.salaryStructures || res.data?.salaryStructures || res.salaryStructures || []);
    } catch (err) {
      error('Failed to load salary structures');
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await employeeApi.getAll({ status: 'ACTIVE' });
      setEmployees(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'payrolls') {
      loadPayrolls();
      loadEmployees();
    } else if (activeTab === 'structures') {
      loadStructures();
      loadEmployees();
    }
  }, [activeTab, payrollFilters]);

  // Actions
  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    if (!generateForm.employee) {
      error('Please select an employee.');
      return;
    }
    if (!window.confirm(`Generate payroll for Month: ${generateForm.month}, Year: ${generateForm.year}?`)) return;
    try {
      await generatePayrollApi.execute(generateForm);
      success('Payroll generated successfully!');
      loadPayrolls();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to generate payroll.');
    }
  };

  const handleApprovePayroll = async (id) => {
    if (!window.confirm('Approve this payroll?')) return;
    try {
      await approvePayrollApi.execute(id);
      success('Payroll approved successfully.');
      loadPayrolls();
      if (selectedPayroll && selectedPayroll._id === id) {
        setSelectedPayroll(prev => ({ ...prev, status: 'APPROVED' }));
      }
    } catch (err) {
      error('Failed to approve payroll.');
    }
  };

  const handleCancelPayroll = async (id) => {
    if (!window.confirm('Cancel this payroll?')) return;
    try {
      await cancelPayrollApi.execute(id);
      success('Payroll cancelled.');
      loadPayrolls();
      if (selectedPayroll && selectedPayroll._id === id) {
        setSelectedPayroll(prev => ({ ...prev, status: 'CANCELLED' }));
      }
    } catch (err) {
      error('Failed to cancel payroll.');
    }
  };

  const handleMarkPaid = async (e) => {
    e.preventDefault();
    if (!payingPayroll) return;
    try {
      await markPaidApi.execute(payingPayroll._id, payForm);
      success('Payroll marked as PAID.');
      setPayingPayroll(null);
      setPayForm({ paymentReference: '' });
      loadPayrolls();
      setSelectedPayroll(null);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to pay payroll.');
    }
  };

  const handleGeneratePayslip = async (payrollId) => {
    try {
      await generatePayslipApi.execute({ payrollId });
      success('Payslip generated successfully!');
      loadPayrolls();
    } catch (err) {
      error(err.response?.data?.message || 'Payslip already generated or failed.');
    }
  };

  const handleOpenStructureAdd = () => {
    setSelectedStructure(null);
    setStructureForm({
      employee: '',
      basicSalary: 0,
      allowances: { houseAllowance: 0, transportAllowance: 0, medicalAllowance: 0, otherAllowance: 0 },
      deductions: { tax: 0, providentFund: 0, insurance: 0, otherDeduction: 0 },
      overtimeRatePerHour: 0,
      status: 'ACTIVE'
    });
    setIsStructureModalOpen(true);
  };

  const handleOpenStructureEdit = (struct) => {
    setSelectedStructure(struct);
    setStructureForm({
      employee: struct.employee?._id || struct.employee || '',
      basicSalary: struct.basicSalary || 0,
      allowances: {
        houseAllowance: struct.allowances?.houseAllowance || 0,
        transportAllowance: struct.allowances?.transportAllowance || 0,
        medicalAllowance: struct.allowances?.medicalAllowance || 0,
        otherAllowance: struct.allowances?.otherAllowance || 0
      },
      deductions: {
        tax: struct.deductions?.tax || 0,
        providentFund: struct.deductions?.providentFund || 0,
        insurance: struct.deductions?.insurance || 0,
        otherDeduction: struct.deductions?.otherDeduction || 0
      },
      overtimeRatePerHour: struct.overtimeRatePerHour || 0,
      status: struct.status || 'ACTIVE'
    });
    setIsStructureModalOpen(true);
  };

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    if (!structureForm.employee || structureForm.basicSalary <= 0) {
      error('Please select an employee and input a valid basic salary.');
      return;
    }
    try {
      if (selectedStructure) {
        await updateStructureApi.execute(selectedStructure._id, structureForm);
        success('Salary structure updated successfully!');
      } else {
        await createStructureApi.execute(structureForm);
        success('Salary structure assigned successfully!');
      }
      setIsStructureModalOpen(false);
      loadStructures();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save salary structure.');
    }
  };

  const handleDeleteStructure = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this salary structure?')) return;
    try {
      await deleteStructureApi.execute(id);
      success('Salary structure deactivated.');
      loadStructures();
    } catch (err) {
      error('Failed to deactivate structure.');
    }
  };

  const monthsList = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll Operations</h1>
          <p className="page-subtitle">Configure compensation profiles, generate monthly salaries, and manage payslips</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'payrolls' ? 'active' : ''}`} onClick={() => { setActiveTab('payrolls'); setSelectedPayroll(null); }}>
          Payrolls Processing
        </button>
        <button className={`tab-btn ${activeTab === 'structures' ? 'active' : ''}`} onClick={() => setActiveTab('structures')}>
          Salary Structures
        </button>
      </div>

      {/* Payrolls Processing Tab */}
      {activeTab === 'payrolls' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedPayroll ? '2.5fr 1.5fr' : '1fr', gap: '24px', alignItems: 'start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Generate payroll bar */}
            <Card className="card-padded" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <DollarSign size={20} className="text-accent" />
                <h3 style={{ fontSize: '14.5px', fontWeight: 600, margin: 0 }}>Process Monthly Payroll</h3>
              </div>
              <form onSubmit={handleGeneratePayroll} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ width: '200px' }}>
                  <select
                    value={generateForm.employee}
                    onChange={e => setGenerateForm(prev => ({ ...prev, employee: e.target.value }))}
                    className="input-field"
                    style={{ height: '38px' }}
                    required
                  >
                    <option value="">-- Select Employee --</option>
                    {employees && employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.personalInfo?.firstName} {emp.personalInfo?.lastName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ width: '130px' }}>
                  <select
                    value={generateForm.month}
                    onChange={e => setGenerateForm(prev => ({ ...prev, month: Number(e.target.value) }))}
                    className="input-field"
                    style={{ height: '38px' }}
                  >
                    {monthsList.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ width: '100px' }}>
                  <Input
                    type="number"
                    value={generateForm.year}
                    onChange={e => setGenerateForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                    min={2000}
                    max={2100}
                  />
                </div>
                <Button type="submit" loading={generatePayrollApi.loading}>
                  Run Calculation
                </Button>
              </form>
            </Card>

            {/* Payroll Listing table */}
            <Card className="card-padded-lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Calculated Payrolls</h3>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '120px' }}>
                    <select
                      value={payrollFilters.month}
                      onChange={e => setPayrollFilters(prev => ({ ...prev, month: Number(e.target.value) }))}
                      className="input-field"
                      style={{ height: '38px' }}
                    >
                      {monthsList.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ width: '100px' }}>
                    <Input
                      type="number"
                      value={payrollFilters.year}
                      onChange={e => setPayrollFilters(prev => ({ ...prev, year: Number(e.target.value) }))}
                    />
                  </div>
                  <div style={{ width: '130px' }}>
                    <select
                      value={payrollFilters.status}
                      onChange={e => setPayrollFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="input-field"
                      style={{ height: '38px' }}
                    >
                      <option value="">All Statuses</option>
                      <option value="DRAFT">Draft</option>
                      <option value="PROCESSED">Processed</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PAID">Paid</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {fetchPayrollsApi.loading && payrolls.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>
              ) : payrolls.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <DollarSign size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p style={{ margin: 0 }}>No payroll records found for selected period.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Basic Salary</th>
                        <th>Net Salary</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrolls.map((p) => {
                        const empName = p.employee
                          ? `${p.employee.personalInfo?.firstName || ''} ${p.employee.personalInfo?.lastName || ''}`
                          : 'Staff Member';
                        return (
                          <tr key={p._id} style={{ cursor: 'pointer', background: selectedPayroll?._id === p._id ? 'var(--bg-hover)' : 'transparent' }} onClick={() => setSelectedPayroll(p)}>
                            <td style={{ fontWeight: 600 }}>{empName}</td>
                            <td>₹{p.basicSalary?.toLocaleString()}</td>
                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{p.netSalary?.toLocaleString()}</td>
                            <td><StatusBadge status={p.status} /></td>
                            <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                {p.status === 'PROCESSED' && (
                                  <>
                                    <Button variant="success" onClick={() => handleApprovePayroll(p._id)} style={{ padding: '4px 8px', height: '28px', minWidth: 'unset' }}>
                                      Approve
                                    </Button>
                                    <Button variant="danger" onClick={() => handleCancelPayroll(p._id)} style={{ padding: '4px 8px', height: '28px', minWidth: 'unset' }}>
                                      Cancel
                                    </Button>
                                  </>
                                )}
                                {p.status === 'APPROVED' && (
                                  <>
                                    <Button onClick={() => setPayingPayroll(p)} style={{ padding: '4px 8px', height: '28px', minWidth: 'unset', gap: '4px' }}>
                                      <CreditCard size={12} /> Pay
                                    </Button>
                                    <Button variant="danger" onClick={() => handleCancelPayroll(p._id)} style={{ padding: '4px 8px', height: '28px', minWidth: 'unset' }}>
                                      Cancel
                                    </Button>
                                  </>
                                )}
                                {['APPROVED', 'PAID'].includes(p.status) && (
                                  <Button variant="secondary" onClick={() => handleGeneratePayslip(p._id)} style={{ padding: '4px 8px', height: '28px', minWidth: 'unset', gap: '4px' }}>
                                    <FileText size={12} /> Slip
                                  </Button>
                                )}
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
          </div>

          {/* Details Side panel */}
          {selectedPayroll && (
            <Card className="card-padded-lg" style={{ position: 'sticky', top: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                    {selectedPayroll.employee ? `${selectedPayroll.employee.personalInfo?.firstName} ${selectedPayroll.employee.personalInfo?.lastName}` : 'Payroll Details'}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Period: {monthsList.find(m => m.value === selectedPayroll.month)?.label} {selectedPayroll.year}
                  </p>
                </div>
                <StatusBadge status={selectedPayroll.status} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                
                {/* Earnings section */}
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px', marginBottom: '8px', color: 'var(--success)' }}>Earnings</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Basic Salary:</span>
                      <strong>₹{selectedPayroll.basicSalary?.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Allowances (House, Travel, Med):</span>
                      <strong>₹{((selectedPayroll.allowances?.houseAllowance || 0) + (selectedPayroll.allowances?.transportAllowance || 0) + (selectedPayroll.allowances?.medicalAllowance || 0) + (selectedPayroll.allowances?.otherAllowance || 0))?.toLocaleString()}</strong>
                    </div>
                    {selectedPayroll.overtime?.amount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Overtime ({selectedPayroll.overtime.hours} hrs):</span>
                        <strong>₹{selectedPayroll.overtime.amount?.toLocaleString()}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dotted var(--border-subtle)', paddingTop: '4px' }}>
                      <span>Gross Salary:</span>
                      <strong>₹{selectedPayroll.grossSalary?.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Deductions section */}
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px', marginBottom: '8px', color: 'var(--danger)' }}>Deductions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tax / PF / Ins:</span>
                      <strong>₹{((selectedPayroll.deductions?.tax || 0) + (selectedPayroll.deductions?.providentFund || 0) + (selectedPayroll.deductions?.insurance || 0))?.toLocaleString()}</strong>
                    </div>
                    {selectedPayroll.deductions?.absentDeduction > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Absent Deductions:</span>
                        <strong>₹{selectedPayroll.deductions.absentDeduction?.toLocaleString()}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dotted var(--border-subtle)', paddingTop: '4px' }}>
                      <span>Total Deductions:</span>
                      <strong>₹{selectedPayroll.totalDeduction?.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Summary section */}
                <div style={{ padding: '12px', background: 'var(--bg-inset)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Net Take-Home:</span>
                  <strong style={{ fontSize: '16px', color: 'var(--accent)' }}>₹{selectedPayroll.netSalary?.toLocaleString()}</strong>
                </div>

                {/* Attendance info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  <div>Present: {selectedPayroll.attendance?.presentDays || 0} days</div>
                  <div>Absent: {selectedPayroll.attendance?.absentDays || 0} days</div>
                </div>

                {/* Admin controls */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {selectedPayroll.status === 'PROCESSED' && (
                    <Button onClick={() => handleApprovePayroll(selectedPayroll._id)} style={{ flex: 1 }}>
                      Approve Payroll
                    </Button>
                  )}
                  {selectedPayroll.status === 'APPROVED' && (
                    <Button onClick={() => setPayingPayroll(selectedPayroll)} style={{ flex: 1 }}>
                      Mark Paid
                    </Button>
                  )}
                  {['PROCESSED', 'APPROVED'].includes(selectedPayroll.status) && (
                    <Button variant="danger" onClick={() => handleCancelPayroll(selectedPayroll._id)} style={{ flex: 1 }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Salary Structures Tab */}
      {activeTab === 'structures' && (
        <Card className="card-padded-lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Employee Salary Structures</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative', width: '200px' }}>
                <Input
                  placeholder="Search staff name..."
                  value={structureSearch}
                  onChange={e => setStructureSearch(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              </div>
              <Button onClick={handleOpenStructureAdd} style={{ gap: '6px' }}>
                <Plus size={15} /> Create Structure
              </Button>
            </div>
          </div>

          {fetchStructuresApi.loading && structures.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>
          ) : structures.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <DollarSign size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ margin: 0 }}>No salary structures configured yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Basic Salary</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>OT Rate / hr</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {structures.filter(s => {
                    const name = s.employee ? `${s.employee.personalInfo?.firstName || ''} ${s.employee.personalInfo?.lastName || ''}`.toLowerCase() : '';
                    return name.includes(structureSearch.toLowerCase());
                  }).map((struct) => {
                    const empName = struct.employee
                      ? `${struct.employee.personalInfo?.firstName || ''} ${struct.employee.personalInfo?.lastName || ''}`
                      : 'Staff Member';
                    const totAllow = (struct.allowances?.houseAllowance || 0) + (struct.allowances?.transportAllowance || 0) + (struct.allowances?.medicalAllowance || 0) + (struct.allowances?.otherAllowance || 0);
                    const totDeduct = (struct.deductions?.tax || 0) + (struct.deductions?.providentFund || 0) + (struct.deductions?.insurance || 0) + (struct.deductions?.otherDeduction || 0);
                    
                    return (
                      <tr key={struct._id}>
                        <td style={{ fontWeight: 600 }}>{empName}</td>
                        <td>₹{struct.basicSalary?.toLocaleString()}</td>
                        <td style={{ color: 'var(--success)' }}>+₹{totAllow?.toLocaleString()}</td>
                        <td style={{ color: 'var(--danger)' }}>-₹{totDeduct?.toLocaleString()}</td>
                        <td>₹{struct.overtimeRatePerHour || 0}</td>
                        <td>
                          <span className={`badge ${struct.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                            {struct.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <Button variant="secondary" onClick={() => handleOpenStructureEdit(struct)} style={{ padding: '4px 8px', height: '28px', minWidth: 'unset' }}>
                              <Edit3 size={13} />
                            </Button>
                            <Button variant="danger" onClick={() => handleDeleteStructure(struct._id)} style={{ padding: '4px 8px', height: '28px', minWidth: 'unset' }}>
                              <Trash2 size={13} />
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

      {/* Salary Structure Add / Edit Modal */}
      <Modal
        isOpen={isStructureModalOpen}
        onClose={() => setIsStructureModalOpen(false)}
        title={selectedStructure ? 'Update Salary Structure' : 'Create Salary Structure'}
        size="lg"
      >
        <form onSubmit={handleSaveStructure} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Select Employee</label>
            <select
              value={structureForm.employee}
              onChange={e => setStructureForm(prev => ({ ...prev, employee: e.target.value }))}
              className="input-field"
              required
              disabled={!!selectedStructure}
            >
              <option value="">-- Select Active Employee --</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.personalInfo?.firstName} {emp.personalInfo?.lastName} ({emp.employeeId})</option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <Input
              label="Basic Salary (INR)"
              type="number"
              value={structureForm.basicSalary}
              onChange={e => setStructureForm(prev => ({ ...prev, basicSalary: Number(e.target.value) }))}
              required
            />
            <Input
              label="Overtime Rate Per Hour (INR)"
              type="number"
              value={structureForm.overtimeRatePerHour}
              onChange={e => setStructureForm(prev => ({ ...prev, overtimeRatePerHour: Number(e.target.value) }))}
            />
          </div>

          <h3 style={{ fontSize: '13.5px', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px', margin: '8px 0 0' }}>Monthly Allowances</h3>
          <div className="form-grid">
            <Input
              label="House Rent Allowance"
              type="number"
              value={structureForm.allowances.houseAllowance}
              onChange={e => setStructureForm(prev => ({ ...prev, allowances: { ...prev.allowances, houseAllowance: Number(e.target.value) } }))}
            />
            <Input
              label="Transport Allowance"
              type="number"
              value={structureForm.allowances.transportAllowance}
              onChange={e => setStructureForm(prev => ({ ...prev, allowances: { ...prev.allowances, transportAllowance: Number(e.target.value) } }))}
            />
          </div>
          <div className="form-grid">
            <Input
              label="Medical Allowance"
              type="number"
              value={structureForm.allowances.medicalAllowance}
              onChange={e => setStructureForm(prev => ({ ...prev, allowances: { ...prev.allowances, medicalAllowance: Number(e.target.value) } }))}
            />
            <Input
              label="Other Allowance"
              type="number"
              value={structureForm.allowances.otherAllowance}
              onChange={e => setStructureForm(prev => ({ ...prev, allowances: { ...prev.allowances, otherAllowance: Number(e.target.value) } }))}
            />
          </div>

          <h3 style={{ fontSize: '13.5px', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px', margin: '8px 0 0' }}>Monthly Deductions</h3>
          <div className="form-grid">
            <Input
              label="Income Tax Deductions"
              type="number"
              value={structureForm.deductions.tax}
              onChange={e => setStructureForm(prev => ({ ...prev, deductions: { ...prev.deductions, tax: Number(e.target.value) } }))}
            />
            <Input
              label="Provident Fund Contribution"
              type="number"
              value={structureForm.deductions.providentFund}
              onChange={e => setStructureForm(prev => ({ ...prev, deductions: { ...prev.deductions, providentFund: Number(e.target.value) } }))}
            />
          </div>
          <div className="form-grid">
            <Input
              label="Health Insurance Deductions"
              type="number"
              value={structureForm.deductions.insurance}
              onChange={e => setStructureForm(prev => ({ ...prev, deductions: { ...prev.deductions, insurance: Number(e.target.value) } }))}
            />
            <Input
              label="Other Deductions"
              type="number"
              value={structureForm.deductions.otherDeduction}
              onChange={e => setStructureForm(prev => ({ ...prev, deductions: { ...prev.deductions, otherDeduction: Number(e.target.value) } }))}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button variant="secondary" type="button" onClick={() => setIsStructureModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createStructureApi.loading || updateStructureApi.loading}>Save Structure</Button>
          </div>
        </form>
      </Modal>

      {/* Pay modal popup */}
      {payingPayroll && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <Card className="card-padded-lg" style={{ width: '400px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Mark Payroll as Paid</h3>
            <form onSubmit={handleMarkPaid} className="flex flex-col gap-4">
              <Input
                label="Payment Reference / Transaction ID"
                placeholder="e.g. TXN-10829384729"
                required
                value={payForm.paymentReference}
                onChange={e => setPayForm(prev => ({ ...prev, paymentReference: e.target.value }))}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Button type="submit" loading={markPaidApi.loading} style={{ flex: 1 }}>
                  Confirm Payment
                </Button>
                <Button type="button" variant="secondary" onClick={() => setPayingPayroll(null)} style={{ flex: 1 }}>
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
