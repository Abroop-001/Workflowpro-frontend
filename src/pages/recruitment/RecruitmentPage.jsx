import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { recruitmentApi } from '../../api/recruitment';
import { departmentApi } from '../../api/departments';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { Plus, Search, HelpCircle, Archive, CheckSquare, PlusCircle } from 'lucide-react';

export default function RecruitmentPage() {
  const { success, error } = useToast();
  
  // State
  const [candidates, setCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', stage: '', department: '' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Forms
  const [addForm, setAddForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    jobTitle: '', department: '', experience: 0, expectedSalary: 0,
    source: 'OTHER', skills: ''
  });
  const [hireForm, setHireForm] = useState({
    employeeId: '', joiningDate: '', designation: '', salary: 0
  });
  const [newNote, setNewNote] = useState('');

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const candRes = await recruitmentApi.getCandidates(filters);
      setCandidates(candRes.candidates || candRes.data || candRes.data?.candidates || []);
      const deptRes = await departmentApi.getAll();
      setDepartments(deptRes.departments || deptRes.data || deptRes.data?.departments || []);
    } catch (err) {
      error('Failed to load recruitment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = addForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      await recruitmentApi.createCandidate({ ...addForm, skills: skillsArray });
      success('Candidate application created');
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create candidate');
    }
  };

  const handleStageChange = async (id, newStage) => {
    try {
      await recruitmentApi.updateStage(id, newStage);
      success('Stage updated successfully');
      loadData();
      if (selectedCandidate && selectedCandidate._id === id) {
        setSelectedCandidate(prev => ({ ...prev, stage: newStage }));
      }
    } catch (err) {
      error('Failed to update stage');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const res = await recruitmentApi.addNote(selectedCandidate._id, newNote);
      success('Note added');
      setSelectedCandidate(res.candidate || res.data?.candidate || res);
      setNewNote('');
    } catch (err) {
      error('Failed to add note');
    }
  };

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    try {
      await recruitmentApi.hireCandidate(selectedCandidate._id, hireForm);
      success('Candidate successfully hired and employee profile created!');
      setIsHireModalOpen(false);
      setIsDetailModalOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to hire candidate');
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Are you sure you want to archive/remove this candidate?')) return;
    try {
      await recruitmentApi.archiveCandidate(id);
      success('Candidate archived');
      setIsDetailModalOpen(false);
      loadData();
    } catch (err) {
      error('Failed to archive candidate');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Recruitment & Candidates</h1>
          <p className="page-subtitle">Manage open job applications, track stages, schedule, and hire talent</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={15} /> Add Candidate
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '220px' }}>
          <Input
            placeholder="Search candidate name..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            style={{ paddingLeft: '32px' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        </div>
        <div style={{ width: '150px' }}>
          <select
            value={filters.stage}
            onChange={e => setFilters(prev => ({ ...prev, stage: e.target.value }))}
            className="input-field"
            style={{ height: '38px' }}
          >
            <option value="">All Stages</option>
            {['APPLIED', 'SCREENING', 'INTERVIEW', 'TECHNICAL', 'HR', 'OFFERED', 'HIRED', 'REJECTED'].map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
        <div style={{ width: '180px' }}>
          <select
            value={filters.department}
            onChange={e => setFilters(prev => ({ ...prev, department: e.target.value }))}
            className="input-field"
            style={{ height: '38px' }}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>
      ) : candidates.length === 0 ? (
        <Card className="card-padded" style={{ textAlign: 'center', padding: '40px' }}>
          <HelpCircle size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No candidates found matching the criteria.</p>
        </Card>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Applied Role</th>
                <th>Department</th>
                <th>Experience</th>
                <th>Source</th>
                <th>Stage</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((cand) => (
                <tr key={cand._id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedCandidate(cand); setIsDetailModalOpen(true); }}>
                  <td style={{ fontWeight: 600 }}>{cand.firstName} {cand.lastName || ''}</td>
                  <td>{cand.jobTitle}</td>
                  <td>{cand.department?.name || 'Unknown'}</td>
                  <td>{cand.experience} yrs</td>
                  <td>{cand.source}</td>
                  <td><StatusBadge status={cand.stage} /></td>
                  <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <select
                        value={cand.stage}
                        onChange={e => handleStageChange(cand._id, e.target.value)}
                        className="input-field"
                        style={{ height: '28px', width: '120px', fontSize: '12px', padding: '2px 6px' }}
                      >
                        {['APPLIED', 'SCREENING', 'INTERVIEW', 'TECHNICAL', 'HR', 'OFFERED', 'HIRED', 'REJECTED'].map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                      <Button variant="secondary" onClick={() => { setSelectedCandidate(cand); setIsDetailModalOpen(true); }} style={{ padding: '4px 10px', height: '28px' }}>
                        View Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Candidate Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Candidate Profile">
        <form onSubmit={handleAddCandidate} className="flex flex-col gap-4">
          <div className="form-grid">
            <Input label="First Name" required value={addForm.firstName} onChange={e => setAddForm(prev => ({ ...prev, firstName: e.target.value }))} />
            <Input label="Last Name" value={addForm.lastName} onChange={e => setAddForm(prev => ({ ...prev, lastName: e.target.value }))} />
          </div>
          <div className="form-grid">
            <Input type="email" label="Email" required value={addForm.email} onChange={e => setAddForm(prev => ({ ...prev, email: e.target.value }))} />
            <Input label="Phone" required value={addForm.phone} onChange={e => setAddForm(prev => ({ ...prev, phone: e.target.value }))} />
          </div>
          <div className="form-grid">
            <Input label="Job Title" required value={addForm.jobTitle} onChange={e => setAddForm(prev => ({ ...prev, jobTitle: e.target.value }))} />
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Department</label>
              <select required className="input-field" value={addForm.department} onChange={e => setAddForm(prev => ({ ...prev, department: e.target.value }))}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <Input type="number" label="Experience (Years)" value={addForm.experience} onChange={e => setAddForm(prev => ({ ...prev, experience: Number(e.target.value) }))} />
            <Input type="number" label="Expected Salary" value={addForm.expectedSalary} onChange={e => setAddForm(prev => ({ ...prev, expectedSalary: Number(e.target.value) }))} />
          </div>
          <div className="form-grid">
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Source</label>
              <select className="input-field" value={addForm.source} onChange={e => setAddForm(prev => ({ ...prev, source: e.target.value }))}>
                {['CAREER_PORTAL', 'LINKEDIN', 'REFERRAL', 'INDEED', 'NAUKRI', 'WALK_IN', 'OTHER'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Input label="Skills (comma separated)" placeholder="React, Node.js, Express" value={addForm.skills} onChange={e => setAddForm(prev => ({ ...prev, skills: e.target.value }))} />
          </div>
          <Button type="submit">Submit Application</Button>
        </form>
      </Modal>

      {/* Candidate Details & Actions Modal */}
      {selectedCandidate && (
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`${selectedCandidate.firstName} ${selectedCandidate.lastName || ''} - Details`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
              <p><strong>Email:</strong> {selectedCandidate.email}</p>
              <p><strong>Phone:</strong> {selectedCandidate.phone}</p>
              <p><strong>Experience:</strong> {selectedCandidate.experience} Years</p>
              <p><strong>Expected Salary:</strong> ₹{selectedCandidate.expectedSalary?.toLocaleString()}</p>
              <p><strong>Current Stage:</strong> <StatusBadge status={selectedCandidate.stage} /></p>
              <p><strong>Source:</strong> {selectedCandidate.source}</p>
              <p style={{ gridColumn: 'span 2' }}><strong>Skills:</strong> {selectedCandidate.skills?.join(', ') || 'None listed'}</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              {selectedCandidate.stage !== 'HIRED' && (
                <Button variant="success" onClick={() => {
                  setHireForm({
                    employeeId: '',
                    joiningDate: new Date().toISOString().split('T')[0],
                    designation: selectedCandidate.jobTitle,
                    salary: selectedCandidate.expectedSalary || 0
                  });
                  setIsHireModalOpen(true);
                }} style={{ flex: 1 }}>
                  <CheckSquare size={14} /> Hire Candidate
                </Button>
              )}
              <Button variant="danger" onClick={() => handleArchive(selectedCandidate._id)} style={{ flex: 1 }}>
                <Archive size={14} /> Archive / Remove
              </Button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Internal Notes</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', marginBottom: '12px' }}>
                {selectedCandidate.notes?.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No notes added yet.</p>
                ) : (
                  selectedCandidate.notes?.map((n, i) => (
                    <div key={i} style={{ background: 'var(--bg-inset)', padding: '8px', borderRadius: '6px', fontSize: '12px' }}>
                      <p style={{ margin: '0 0 4px 0' }}>{n.comment}</p>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px' }}>
                <Input placeholder="Type a note..." value={newNote} onChange={e => setNewNote(e.target.value)} style={{ flex: 1 }} />
                <Button type="submit"><PlusCircle size={14} /> Add</Button>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* Hire Modal */}
      <Modal isOpen={isHireModalOpen} onClose={() => setIsHireModalOpen(false)} title="Convert Candidate to Employee">
        <form onSubmit={handleHireSubmit} className="flex flex-col gap-4">
          <Input label="Employee ID" required placeholder="EMP101" value={hireForm.employeeId} onChange={e => setHireForm(prev => ({ ...prev, employeeId: e.target.value }))} />
          <Input type="date" label="Joining Date" required value={hireForm.joiningDate} onChange={e => setHireForm(prev => ({ ...prev, joiningDate: e.target.value }))} />
          <Input label="Designation / Job Title" required value={hireForm.designation} onChange={e => setHireForm(prev => ({ ...prev, designation: e.target.value }))} />
          <Input type="number" label="Offered Salary" required value={hireForm.salary} onChange={e => setHireForm(prev => ({ ...prev, salary: Number(e.target.value) }))} />
          <Button type="submit" variant="success">Confirm Hiring</Button>
        </form>
      </Modal>
    </div>
  );
}
