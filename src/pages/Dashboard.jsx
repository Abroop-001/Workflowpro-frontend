import { useAuth } from '../context/AuthContext';
import SuperAdminDashboard from './dashboard/SuperAdminDashboard';
import CompanyAdminDashboard from './dashboard/CompanyAdminDashboard';
import HRDashboard from './dashboard/HRDashboard';
import ManagerDashboard from './dashboard/ManagerDashboard';
import EmployeeDashboard from './dashboard/EmployeeDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  const role = user?.role;

  switch (role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    case 'COMPANY_ADMIN':
      return <CompanyAdminDashboard />;
    case 'HR':
      return <HRDashboard />;
    case 'MANAGER':
      return <ManagerDashboard />;
    case 'EMPLOYEE':
      return <EmployeeDashboard />;
    default:
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 mb-1">Access Denied</h1>
            <p className="text-sm text-gray-500">You do not have a valid role assigned.</p>
          </div>
        </div>
      );
  }
}
