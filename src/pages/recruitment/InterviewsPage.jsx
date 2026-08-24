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
import { Plus, Calendar, Mail, Phone, Briefcase, HelpCircle } from 'lucide-react';

export default function InterviewsPage() {
  const { success, error } = useToast();

  const [interviews, setInterviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals & Forms
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    position: '',
    interviewer: '',
    interviewDate: '',
    interviewTime: '',
    interviewType: 'ONLINE',
    status: 'SCHEDULED'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const intRes = await recruitmentApi.getInterviews();
      setInterviews(intRes.data?.data?.interviews || intRes.data?.interviews || intRes.interviews || []);
      const empRes = await employeeApi.getAll({ status: 'ACTIVE' });
      setEmployees(empRes.data?.data?.employees || empRes.data?.employees || empRes.employees || []);
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
      setScheduleForm({
        candidateName: '',
        candidateEmail: '',
        candidatePhone: '',
        position: '',
        interviewer: '',
        interviewDate: '',
        interviewTime: '',
        interviewType: 'ONLINE',
        status: 'SCHEDULED'
      });
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to schedule interview');
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
          <h1 className="page-title">Candidate Interviews</h1>
          <p className="page-subtitle">Schedule, track, and manage interviewer assignments for candidates</p>
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
                <th>Contact</th>
                <th>Position</th>
                <th>Interviewer</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: 600 }}>{item.candidateName}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                        <Mail size={12} /> {item.candidateEmail}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                        <Phone size={12} /> {item.candidatePhone}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <Briefcase size={13} style={{ opacity: 0.7 }} /> {item.position}
                    </span>
                  </td>
                  <td>{item.interviewer?.name || 'Assigned User'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                      <span>{new Date(item.interviewDate).toLocaleDateString()}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{item.interviewTime}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-info">{item.interviewType}</span></td>
                  <td><StatusBadge status={item.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <select
                      value={item.status}
                      onChange={e => handleStatusChange(item._id, e.target.value)}
                      className="input-field"
                      style={{ height: '28px', width: '120px', fontSize: '11px', padding: '2px 6px' }}
                    >
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title="Schedule Candidate Interview">
        <form onSubmit={handleScheduleSubmit} className="flex flex-col gap-4">
          <div className="form-grid">
            <Input
              label="Candidate Name"
              required
              placeholder="e.g. John Doe"
              value={scheduleForm.candidateName}
              onChange={e => setScheduleForm(prev => ({ ...prev, candidateName: e.target.value }))}
            />
            <Input
              type="email"
              label="Candidate Email"
              required
              placeholder="e.g. john.doe@example.com"
              value={scheduleForm.candidateEmail}
              onChange={e => setScheduleForm(prev => ({ ...prev, candidateEmail: e.target.value }))}
            />
          </div>

          <div className="form-grid">
            <Input
              label="Candidate Phone"
              required
              placeholder="e.g. +1 555-0199"
              value={scheduleForm.candidatePhone}
              onChange={e => setScheduleForm(prev => ({ ...prev, candidatePhone: e.target.value }))}
            />
            <Input
              label="Position"
              required
              placeholder="e.g. Frontend Engineer"
              value={scheduleForm.position}
              onChange={e => setScheduleForm(prev => ({ ...prev, position: e.target.value }))}
            />
          </div>

          <div className="form-grid">
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Interviewer (User)</label>
              <select
                required
                className="input-field"
                value={scheduleForm.interviewer}
                onChange={e => setScheduleForm(prev => ({ ...prev, interviewer: e.target.value }))}
                style={{ width: '100%' }}
              >
                <option value="">Select Interviewer</option>
                {employees.filter(e => e.user).map(e => (
                  <option key={e.user._id} value={e.user._id}>
                    {e.personalInfo.firstName} {e.personalInfo.lastName || ''} ({e.user.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Interview Type</label>
              <select
                className="input-field"
                value={scheduleForm.interviewType}
                onChange={e => setScheduleForm(prev => ({ ...prev, interviewType: e.target.value }))}
                style={{ width: '100%' }}
              >
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="PHONE">Phone</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <Input
              type="date"
              label="Interview Date"
              required
              value={scheduleForm.interviewDate}
              onChange={e => setScheduleForm(prev => ({ ...prev, interviewDate: e.target.value }))}
            />
            <Input
              type="time"
              label="Interview Time"
              required
              value={scheduleForm.interviewTime}
              onChange={e => setScheduleForm(prev => ({ ...prev, interviewTime: e.target.value }))}
            />
          </div>

          <Button type="submit">Schedule Interview</Button>
        </form>
      </Modal>
    </div>
  );
}
