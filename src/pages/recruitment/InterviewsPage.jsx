import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { recruitmentApi } from '../../api/recruitment';
import { employeeApi } from '../../api/employees';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { Plus, Calendar, Star, HelpCircle } from 'lucide-react';

export default function InterviewsPage() {
  const { success, error } = useToast();

  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals & Forms
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const [scheduleForm, setScheduleForm] = useState({
    candidate: '', round: 'SCREENING', interviewer: '',
    scheduledDate: '', duration: 60, mode: 'ONLINE',
    meetingLink: '', location: ''
  });

  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5, comments: '', recommendation: 'SELECT'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const intRes = await recruitmentApi.getInterviews();
      setInterviews(intRes.interviews || intRes.data || intRes.data?.interviews || []);
      const candRes = await recruitmentApi.getCandidates();
      setCandidates(candRes.candidates || candRes.data || candRes.data?.candidates || []);
      const empRes = await employeeApi.getAll({ status: 'ACTIVE' });
      setEmployees(empRes.employees || empRes.data || empRes.data?.employees || []);
    } catch (err) {
      error('Failed to load interviews data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await recruitmentApi.scheduleInterview(scheduleForm);
      success('Interview scheduled successfully');
      setIsScheduleOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to schedule interview');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await recruitmentApi.submitFeedback(selectedInterview._id, feedbackForm);
      success('Feedback submitted and round completed');
      setIsFeedbackOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await recruitmentApi.updateInterviewStatus(id, status);
      success('Interview status updated');
      loadData();
    } catch (err) {
      error('Failed to update status');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Interviews Dashboard</h1>
          <p className="page-subtitle">Schedule recruitment rounds, track interviewer allocations, and capture evaluations</p>
        </div>
        <Button onClick={() => setIsScheduleOpen(true)}>
          <Plus size={15} /> Schedule Interview
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div>
      ) : interviews.length === 0 ? (
        <Card className="card-padded" style={{ textAlign: 'center', padding: '40px' }}>
          <Calendar size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No interviews scheduled yet.</p>
        </Card>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Round</th>
                <th>Interviewer</th>
                <th>Date & Time</th>
                <th>Mode</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: 600 }}>
                    {item.candidate ? `${item.candidate.firstName} ${item.candidate.lastName || ''}` : 'Unknown'}
                  </td>
                  <td><span className="badge badge-info">{item.round}</span></td>
                  <td>{item.interviewer?.name || 'Assigned User'}</td>
                  <td>{new Date(item.scheduledDate).toLocaleString()}</td>
                  <td>{item.mode}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {item.status === 'SCHEDULED' && (
                        <>
                          <Button variant="success" onClick={() => { setSelectedInterview(item); setIsFeedbackOpen(true); }} style={{ padding: '4px 10px', height: '28px', fontSize: '12px' }}>
                            Submit Feedback
                          </Button>
                          <select
                            value={item.status}
                            onChange={e => handleStatusChange(item._id, e.target.value)}
                            className="input-field"
                            style={{ height: '28px', width: '110px', fontSize: '11px', padding: '2px 6px' }}
                          >
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="CANCELLED">Cancel</option>
                          </select>
                        </>
                      )}
                      {item.status === 'COMPLETED' && item.feedback && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <Star size={12} className="text-yellow-500" style={{ fill: 'currentColor' }} />
                          <span>{item.feedback.rating}/5 ({item.feedback.recommendation})</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title="Schedule Interview Round">
        <form onSubmit={handleScheduleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Candidate</label>
            <select required className="input-field" value={scheduleForm.candidate} onChange={e => setScheduleForm(prev => ({ ...prev, candidate: e.target.value }))}>
              <option value="">Select Candidate</option>
              {candidates.filter(c => c.stage !== 'HIRED' && c.stage !== 'REJECTED').map(c => (
                <option key={c._id} value={c._id}>{c.firstName} {c.lastName || ''} ({c.jobTitle})</option>
              ))}
            </select>
          </div>
          <div className="form-grid">
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Round</label>
              <select className="input-field" value={scheduleForm.round} onChange={e => setScheduleForm(prev => ({ ...prev, round: e.target.value }))}>
                {['SCREENING', 'TECHNICAL', 'MANAGERIAL', 'HR', 'FINAL'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Interviewer (User)</label>
              <select required className="input-field" value={scheduleForm.interviewer} onChange={e => setScheduleForm(prev => ({ ...prev, interviewer: e.target.value }))}>
                <option value="">Select Interviewer</option>
                {employees.filter(e => e.user).map(e => (
                  <option key={e.user._id} value={e.user._id}>{e.personalInfo.firstName} {e.personalInfo.lastName || ''} ({e.user.role})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <Input type="datetime-local" label="Scheduled Date & Time" required value={scheduleForm.scheduledDate} onChange={e => setScheduleForm(prev => ({ ...prev, scheduledDate: e.target.value }))} />
            <Input type="number" label="Duration (Minutes)" value={scheduleForm.duration} onChange={e => setScheduleForm(prev => ({ ...prev, duration: Number(e.target.value) }))} />
          </div>
          <div className="form-grid">
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Mode</label>
              <select className="input-field" value={scheduleForm.mode} onChange={e => setScheduleForm(prev => ({ ...prev, mode: e.target.value }))}>
                {['ONLINE', 'OFFLINE', 'PHONE'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <Input label="Meeting Link (Online)" value={scheduleForm.meetingLink} onChange={e => setScheduleForm(prev => ({ ...prev, meetingLink: e.target.value }))} />
          </div>
          {scheduleForm.mode === 'OFFLINE' && (
            <Input label="Location" value={scheduleForm.location} onChange={e => setScheduleForm(prev => ({ ...prev, location: e.target.value }))} />
          )}
          <Button type="submit">Schedule Interview</Button>
        </form>
      </Modal>

      {/* Submit Feedback Modal */}
      {selectedInterview && (
        <Modal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} title={`Submit Interview Feedback: ${selectedInterview.candidate?.firstName || 'Candidate'}`}>
          <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-4">
            <div className="form-grid">
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Rating (1-5)</label>
                <select className="input-field" value={feedbackForm.rating} onChange={e => setFeedbackForm(prev => ({ ...prev, rating: Number(e.target.value) }))}>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Recommendation</label>
                <select className="input-field" value={feedbackForm.recommendation} onChange={e => setFeedbackForm(prev => ({ ...prev, recommendation: e.target.value }))}>
                  {['SELECT', 'REJECT', 'HOLD'].map(rec => <option key={rec} value={rec}>{rec}</option>)}
                </select>
              </div>
            </div>
            <Input label="Comments / Feedback Details" required placeholder="Describe performance, strengths, weaknesses..." value={feedbackForm.comments} onChange={e => setFeedbackForm(prev => ({ ...prev, comments: e.target.value }))} />
            <Button type="submit" variant="success">Submit Feedback</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
