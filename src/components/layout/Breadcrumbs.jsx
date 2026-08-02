import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// Map path segments to human-readable labels
const LABELS = {
  'app': null,
  'super-admin': null,
  'company': null,
  'hr': null,
  'manager': null,
  'employee': null,
  'dashboard': 'Dashboard',
  'employees': 'Employees',
  'departments': 'Departments',
  'attendance': 'Attendance',
  'leaves': 'Leave Management',
  'leave': 'Leave Management',
  'shifts': 'Shifts',
  'shift': 'Shifts',
  'payroll': 'Payroll',
  'salary-structure': 'Salary Structure',
  'payslips': 'Payslips',
  'performance': 'Performance',
  'notifications': 'Notifications',
  'audit-logs': 'Audit Logs',
  'companies': 'Companies',
  'users': 'Users',
  'new': 'New',
  'edit': 'Edit',
  'profile': 'My Profile',
  'my-attendance': 'My Attendance',
  'my-leaves': 'My Leaves',
  'my-payslips': 'My Payslips',
  'my-documents': 'My Documents',
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();

  const segments = pathname.split('/').filter(Boolean);

  // Build items: skip role prefix segments, treat the rest as breadcrumb items
  const roleSegments = ['super-admin', 'company', 'hr', 'manager', 'employee'];
  const rolePrefixIdx = segments.findIndex(s => roleSegments.includes(s));
  const relevantSegments = rolePrefixIdx >= 0 ? segments.slice(rolePrefixIdx + 1) : segments;

  if (relevantSegments.length === 0) return null;

  const items = relevantSegments.map((seg, i) => {
    const label = LABELS[seg] ?? seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    // Build path up to this segment
    const path = '/' + segments.slice(0, rolePrefixIdx + 1 + i + 1).join('/');
    const isLast = i === relevantSegments.length - 1;
    return { label, path, isLast };
  });

  return (
    <nav className="breadcrumbs">
      <div className="breadcrumb-item">
        <Home size={13} style={{ color: 'var(--text-muted)' }} />
      </div>
      {items.map((item, i) => (
        <div className="breadcrumb-item" key={i}>
          <ChevronRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          {item.isLast ? (
            <span className="breadcrumb-current">{item.label}</span>
          ) : (
            <Link to={item.path} className="breadcrumb-link">{item.label}</Link>
          )}
        </div>
      ))}
    </nav>
  );
}
