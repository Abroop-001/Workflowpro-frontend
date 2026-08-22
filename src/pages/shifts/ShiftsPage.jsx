import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { shiftApi } from '../../api/shifts';
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

export default function ShiftsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 60,
    workingHours: 8,
    gracePeriod: 15,
    isNightShift: false,
    status: 'ACTIVE'
  });

  // Fetch shifts
  const { 
    data: shiftsResponse, 
    loading: loadingShifts, 
    error: errorShifts, 
    refetch: refetchShifts 
  } = useFetch(shiftApi.getAll);

  const shifts = shiftsResponse?.shifts || [];

  const resetForm = () => {
    setForm({
      name: '',
      startTime: '09:00',
      endTime: '17:00',
      breakDuration: 60,
      workingHours: 8,
      gracePeriod: 15,
      isNightShift: false,
      status: 'ACTIVE'
    });
    setSelectedShift(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shift) => {
    setSelectedShift(shift);
    setForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakDuration: shift.breakDuration ?? 60,
      workingHours: shift.workingHours ?? 8,
      gracePeriod: shift.gracePeriod ?? 15,
      isNightShift: !!shift.isNightShift,
      status: shift.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shift schedule?')) return;
    try {
      await shiftApi.delete(id);
      success('Shift deleted successfully.');
      refetchShifts();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete shift.');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this shift?')) return;
    try {
      await shiftApi.deactivate(id);
      success('Shift deactivated successfully.');
      refetchShifts();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to deactivate shift.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.startTime || !form.endTime) {
      error('Shift Name, Start Time, and End Time are required.');
      return;
    }

    const payload = {
      name: form.name,
      startTime: form.startTime,
      endTime: form.endTime,
      breakDuration: Number(form.breakDuration),
      workingHours: Number(form.workingHours),
      gracePeriod: Number(form.gracePeriod),
      isNightShift: form.isNightShift,
      status: form.status
    };

    setSaving(true);
    try {
      if (selectedShift) {
        await shiftApi.update(selectedShift._id, { ...payload, status: form.status });
        success('Shift updated successfully!');
      } else {
        await shiftApi.create(payload);
        success('Shift created successfully!');
      }
      setIsModalOpen(false);
      refetchShifts();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save shift.');
    } finally {
      setSaving(false);
    }
  };

  const filteredShifts = (shifts || []).filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'COMPANY_ADMIN';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Shift Management</h1>
          <p className="page-subtitle">Configure company working hours, shift timings, break durations, and grace periods</p>
        </div>
        {isHrOrAdmin && (
          <Button onClick={handleOpenAdd} className="btn-primary" style={{ gap: '6px' }}>
            <Plus size={15} /> Create Shift
          </Button>
        )}
      </div>

      <Card className="card-padded" style={{ marginBottom: '20px' }}>
        <div className="search-bar" style={{ maxWidth: '400px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by shift name..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {loadingShifts ? (
        <Loading />
      ) : errorShifts ? (
        <ErrorState message={errorShifts} onRetry={refetchShifts} />
      ) : filteredShifts.length === 0 ? (
        <Card className="card-padded">
          <EmptyState title="No shifts found" description="Create a shift schedule to get started." />
        </Card>
      ) : (
        <Card style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Shift Name</th>
                <th>Timings</th>
                <th>Working Hours</th>
                <th>Break</th>
                <th>Grace Period</th>
                <th>Night Shift</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.map(shift => (
                <tr key={shift._id}>
                  <td style={{ fontWeight: 600 }}>{shift.name}</td>
                  <td>{shift.startTime} - {shift.endTime}</td>
                  <td>{shift.workingHours} hrs</td>
                  <td>{shift.breakDuration} mins</td>
                  <td>{shift.gracePeriod} mins</td>
                  <td>{shift.isNightShift ? 'Yes' : 'No'}</td>
                  <td>
                    <StatusBadge status={shift.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isHrOrAdmin && (
                        <button onClick={() => handleOpenEdit(shift)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                          <Edit size={14} />
                        </button>
                      )}
                      {isHrOrAdmin && shift.status === 'ACTIVE' && (
                        <button onClick={() => handleDeactivate(shift._id)} className="btn btn-secondary btn-sm" style={{ padding: '6px', color: 'var(--text-secondary)' }} title="Deactivate Shift">
                          Deactivate
                        </button>
                      )}
                      {user?.role === 'COMPANY_ADMIN' && (
                        <button onClick={() => handleDelete(shift._id)} className="btn btn-danger btn-sm" style={{ padding: '6px' }} title="Delete Shift">
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
        title={selectedShift ? 'Edit Shift' : 'Create Shift'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input 
            label="Shift Name" 
            placeholder="e.g. Morning Shift" 
            required
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input 
                type="time" 
                className="form-input" 
                required
                value={form.startTime}
                onChange={e => setForm(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input 
                type="time" 
                className="form-input" 
                required
                value={form.endTime}
                onChange={e => setForm(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Input 
              label="Working Hours" 
              type="number"
              min="1"
              max="24"
              required
              value={form.workingHours}
              onChange={e => setForm(prev => ({ ...prev, workingHours: e.target.value }))}
            />
            <Input 
              label="Break (mins)" 
              type="number"
              min="0"
              required
              value={form.breakDuration}
              onChange={e => setForm(prev => ({ ...prev, breakDuration: e.target.value }))}
            />
            <Input 
              label="Grace Period (mins)" 
              type="number"
              min="0"
              required
              value={form.gracePeriod}
              onChange={e => setForm(prev => ({ ...prev, gracePeriod: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
            <input 
              type="checkbox" 
              id="isNightShift"
              checked={form.isNightShift}
              onChange={e => setForm(prev => ({ ...prev, isNightShift: e.target.checked }))}
            />
            <label htmlFor="isNightShift" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Night Shift</label>
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
            <Button type="submit" loading={saving}>Save Shift</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
