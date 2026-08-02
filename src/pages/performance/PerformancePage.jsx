import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { performanceApi } from '../../api/performance';
import { employeeApi } from '../../api/employees';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { Plus, Target, Award, Star, MessageSquare } from 'lucide-react';

export default function PerformancePage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const isStaff = ['COMPANY_ADMIN', 'HR', 'MANAGER'].includes(user?.role);
  const [activeTab, setActiveTab] = useState(isStaff ? 'reviews' : 'self');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  
  // Reviews state
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSelfOpen, setIsSelfOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    employee: '', reviewPeriod: `${new Date().getFullYear()}-Q1`,
    goals: [{ title: '', description: '', status: 'PENDING' }]
  });
  const [selfForm, setSelfForm] = useState({ rating: 5, comments: '' });
  const [managerForm, setManagerForm] = useState({ rating: 5, comments: '' });

  // Load My / Staff Reviews
  const loadReviews = async () => {
    setLoading(true);
    try {
      if (isStaff) {
        const empRes = await employeeApi.getAll({ status: 'ACTIVE' });
        setEmployees(empRes.employees || empRes.data || empRes.data?.employees || []);
        if (selectedEmpId) {
          const revRes = await performanceApi.getByEmployee(selectedEmpId);
          setReviews(revRes.performances || revRes.data?.performances || revRes || []);
        } else {
          setReviews([]);
        }
      } else {
        const profileRes = await api.get('/self-service/profile');
        const empId = profileRes.data?.data?.employee?._id || profileRes.data?.employee?._id;
        if (empId) {
          const revRes = await performanceApi.getByEmployee(empId);
          setReviews(revRes.performances || revRes.data?.performances || revRes || []);
        }
      }
    } catch (err) {
      error('Failed to load performance reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [selectedEmpId]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await performanceApi.create(createForm);
      success('Performance review goals configured');
      setIsCreateOpen(false);
      loadReviews();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create review');
    }
  };

  const handleSelfSubmit = async (e) => {
    e.preventDefault();
    try {
      await performanceApi.submitSelfReview(selectedReview._id, selfForm);
      success('Self evaluation submitted successfully!');
      setIsSelfOpen(false);
      loadReviews();
    } catch (err) {
      error('Failed to submit evaluation');
    }
  };

  const handleManagerSubmit = async (e) => {
    e.preventDefault();
    try {
      await performanceApi.submitManagerReview(selectedReview._id, managerForm);
      success('Manager review submitted successfully!');
      setIsManagerOpen(false);
      loadReviews();
    } catch (err) {
      error('Failed to submit evaluation');
    }
  };

  const handleGoalStatusToggle = async (reviewId, goalId, currentStatus) => {
    const nextStatus = currentStatus === 'PENDING' ? 'IN_PROGRESS' : currentStatus === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING';
    try {
      await performanceApi.updateGoalStatus(reviewId, { goalId, status: nextStatus });
      success('Goal status updated');
      loadReviews();
    } catch (err) {
      error('Failed to update goal');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance reviews</h1>
          <p className="page-subtitle">Track key goals, record evaluations, and manage company review cycles</p>
        </div>
        {isStaff && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus size={15} /> Setup Review Cycle
          </Button>
        )}
      </div>

      {isStaff && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Select Employee:</span>
          <select
            value={selectedEmpId}
            onChange={e => setSelectedEmpId(e.target.value)}
            className="input-field"
            style={{ width: '220px', height: '38px' }}
          >
            <option value="">Choose employee...</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>{emp.personalInfo.firstName} {emp.personalInfo.lastName || ''}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>
      ) : reviews.length === 0 ? (
        <Card className="card-padded" style={{ textAlign: 'center', padding: '40px' }}>
          <Target size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{isStaff ? 'Please select an employee to view records.' : 'No performance reviews assigned yet.'}</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviews.map((rev) => (
            <Card key={rev._id} className="card-padded-lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Review Cycle: {rev.reviewPeriod}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Status: <StatusBadge status={rev.status} /></p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!isStaff && rev.status === 'SELF_REVIEW' && (
                    <Button onClick={() => { setSelectedReview(rev); setIsSelfOpen(true); }} style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Submit Self Evaluation
                    </Button>
                  )}
                  {isStaff && rev.status === 'MANAGER_REVIEW' && (
                    <Button variant="success" onClick={() => { setSelectedReview(rev); setIsManagerOpen(true); }} style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Submit Manager Review
                    </Button>
                  )}
                </div>
              </div>

              {/* Goals */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={14} /> Key Goals</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {rev.goals?.map((goal) => (
                    <div key={goal._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-inset)', padding: '10px 14px', borderRadius: '8px' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>{goal.title}</p>
                        {goal.description && <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>{goal.description}</p>}
                      </div>
                      <Button variant="secondary" onClick={() => handleGoalStatusToggle(rev._id, goal._id, goal.status)} style={{ padding: '4px 10px', height: '26px', fontSize: '11px' }}>
                        {goal.status}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12.5px' }} className="flex flex-col md:grid">
                <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px' }}>
                  <h5 style={{ fontWeight: 600, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={13} /> Self Evaluation</h5>
                  {rev.selfReview?.rating ? (
                    <>
                      <p><strong>Rating:</strong> {rev.selfReview.rating} / 5</p>
                      <p><strong>Comments:</strong> {rev.selfReview.comments}</p>
                    </>
                  ) : <p style={{ color: 'var(--text-muted)' }}>Self evaluation pending.</p>}
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px' }}>
                  <h5 style={{ fontWeight: 600, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={13} /> Manager Review</h5>
                  {rev.managerReview?.rating ? (
                    <>
                      <p><strong>Rating:</strong> {rev.managerReview.rating} / 5</p>
                      <p><strong>Comments:</strong> {rev.managerReview.comments}</p>
                    </>
                  ) : <p style={{ color: 'var(--text-muted)' }}>Manager review pending.</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Setup Cycle Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Configure Performance review Cycle">
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <div>
            <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Employee</label>
            <select required className="input-field" value={createForm.employee} onChange={e => setCreateForm(prev => ({ ...prev, employee: e.target.value }))}>
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.personalInfo.firstName} {emp.personalInfo.lastName || ''}</option>
              ))}
            </select>
          </div>
          <Input label="Review Period" required placeholder="e.g. 2026-Q1" value={createForm.reviewPeriod} onChange={e => setCreateForm(prev => ({ ...prev, reviewPeriod: e.target.value }))} />
          
          <div>
            <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Key Goals</label>
            {createForm.goals.map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <Input placeholder="Goal Title" required value={g.title} onChange={e => {
                  const updated = [...createForm.goals];
                  updated[i].title = e.target.value;
                  setCreateForm(prev => ({ ...prev, goals: updated }));
                }} style={{ flex: 1 }} />
                <Input placeholder="Goal Description" value={g.description} onChange={e => {
                  const updated = [...createForm.goals];
                  updated[i].description = e.target.value;
                  setCreateForm(prev => ({ ...prev, goals: updated }));
                }} style={{ flex: 2 }} />
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => setCreateForm(prev => ({ ...prev, goals: [...prev.goals, { title: '', description: '', status: 'PENDING' }] }))} style={{ padding: '6px 12px', fontSize: '11px', marginTop: '4px' }}>
              + Add Goal
            </Button>
          </div>

          <Button type="submit" style={{ marginTop: '12px' }}>Configure Review Cycle</Button>
        </form>
      </Modal>

      {/* Self Evaluation Modal */}
      {selectedReview && (
        <Modal isOpen={isSelfOpen} onClose={() => setIsSelfOpen(false)} title="Submit Self Evaluation">
          <form onSubmit={handleSelfSubmit} className="flex flex-col gap-4">
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Rating (1-5)</label>
              <select className="input-field" value={selfForm.rating} onChange={e => setSelfForm(prev => ({ ...prev, rating: Number(e.target.value) }))}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
            <Input label="Your Comments / Performance Notes" required placeholder="Describe your accomplishments, growth, goals achieved..." value={selfForm.comments} onChange={e => setSelfForm(prev => ({ ...prev, comments: e.target.value }))} />
            <Button type="submit">Submit Evaluation</Button>
          </form>
        </Modal>
      )}

      {/* Manager Evaluation Modal */}
      {selectedReview && (
        <Modal isOpen={isManagerOpen} onClose={() => setIsManagerOpen(false)} title="Submit Manager Review">
          <form onSubmit={handleManagerSubmit} className="flex flex-col gap-4">
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Rating (1-5)</label>
              <select className="input-field" value={managerForm.rating} onChange={e => setManagerForm(prev => ({ ...prev, rating: Number(e.target.value) }))}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
            <Input label="Manager Remarks / Feedback" required placeholder="Describe strengths, opportunities, and overall assessment..." value={managerForm.comments} onChange={e => setManagerForm(prev => ({ ...prev, comments: e.target.value }))} />
            <Button type="submit" variant="success">Submit evaluation</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
