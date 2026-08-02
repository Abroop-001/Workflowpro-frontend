import { useFetch } from '../../hooks/useFetch';
import { selfServiceApi } from '../../api/selfService';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import { User, Mail, Phone, CalendarDays, Briefcase, Award } from 'lucide-react';

export default function MyProfile() {
  const { data: profile, loading, error, refetch } = useFetch(selfServiceApi.getProfile);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const user = profile?.user || {};
  const employee = profile?.employee || {};
  const personal = employee.personalInfo || {};
  const job = employee.jobInfo || {};

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">View your personal and employment details</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="md:grid-cols-3">
        {/* Left Column - Card avatar */}
        <Card className="card-padded" style={{ textAlign: 'center', height: 'fit-content' }}>
          <div className="avatar avatar-xl" style={{ margin: '0 auto 16px', width: '90px', height: '90px', fontSize: '28px' }}>
            {user.name ? user.name[0].toUpperCase() : 'E'}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>{user.name}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
            {job.designation || 'Unassigned Role'}
          </p>
          <div className="badge badge-success" style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex' }}>
            {employee.status || 'ACTIVE'}
          </div>
        </Card>

        {/* Right Column - Info sections */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card className="card-padded-lg">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <User size={16} /> Personal Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13.5px' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '11px', textTransform: 'uppercase' }}>Full Name</p>
                <p style={{ fontWeight: 600, margin: 0 }}>{personal.firstName} {personal.lastName}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '11px', textTransform: 'uppercase' }}>Gender</p>
                <p style={{ fontWeight: 600, margin: 0 }}>{personal.gender || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '11px', textTransform: 'uppercase' }}>Email Address</p>
                <p style={{ fontWeight: 600, margin: 0 }}>{personal.email || user.email}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '11px', textTransform: 'uppercase' }}>Phone Number</p>
                <p style={{ fontWeight: 600, margin: 0 }}>{personal.phone || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '11px', textTransform: 'uppercase' }}>Date of Birth</p>
                <p style={{ fontWeight: 600, margin: 0 }}>{personal.dateOfBirth ? new Date(personal.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </Card>

          <Card className="card-padded-lg">
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <Briefcase size={16} /> Employment Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13.5px' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '11px', textTransform: 'uppercase' }}>Employee ID</p>
                <p style={{ fontWeight: 600, margin: 0 }}>{employee.employeeId || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '11px', textTransform: 'uppercase' }}>Department</p>
                <p style={{ fontWeight: 600, margin: 0 }}>{employee.department?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '11px', textTransform: 'uppercase' }}>Employment Type</p>
                <p style={{ fontWeight: 600, margin: 0 }}>{job.employmentType?.replace('_', ' ') || 'FULL TIME'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '11px', textTransform: 'uppercase' }}>Joining Date</p>
                <p style={{ fontWeight: 600, margin: 0 }}>{job.joiningDate ? new Date(job.joiningDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
