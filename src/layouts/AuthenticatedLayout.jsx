import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { notificationApi } from '../api/notifications';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import {
  Menu, ChevronDown, Bell, LogOut, User as UserIcon, Settings,
  Users, Layers, FolderPlus, FileText, Calendar, Clock,
  BarChart, Activity, ShieldAlert, Award
} from 'lucide-react';
import Spinner from '../components/ui/Spinner';

const ROLE_ICONS = {
  SUPER_ADMIN: ShieldAlert,
  COMPANY_ADMIN: Settings,
  HR: Layers,
  MANAGER: Users,
  EMPLOYEE: UserIcon
};

export default function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Fetch unread count & notifications
  const fetchNotifications = async () => {
    if (user?.role === 'SUPER_ADMIN') return; // Super admin doesn't have company notifications typically
    setLoadingNotifs(true);
    try {
      const res = await notificationApi.getAll({ limit: 5 });
      setNotifications(res.data?.data || []);
      const countRes = await notificationApi.getUnreadCount();
      setUnreadCount(countRes.data?.data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle outside clicks for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      success('Logged out successfully.');
      navigate('/login');
    } catch (err) {
      error('Failed to logout.');
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  // Get sidebar links based on role
  const getNavLinks = () => {
    const role = user?.role;
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: BarChart },
          { label: 'Platform Audit Logs', path: '/audit-logs', icon: Activity }
        ];
      case 'COMPANY_ADMIN':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: BarChart },
          { label: 'Employees', path: '/employees', icon: Users },
          { label: 'Departments', path: '/departments', icon: FolderPlus },
          { label: 'Shifts', path: '/shifts', icon: Clock },
          { label: 'Attendance', path: '/attendance', icon: Activity },
          { label: 'Leave approvals', path: '/leaves', icon: Calendar },
          { label: 'Payroll', path: '/payroll', icon: FileText },
          { label: 'Documents', path: '/documents', icon: FileText },
          { label: 'Interviews', path: '/interviews', icon: Calendar },
          { label: 'Performance', path: '/performance', icon: Award },
          { label: 'Audit Logs', path: '/audit-logs', icon: Activity }
        ];
      case 'HR':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: BarChart },
          { label: 'Employees', path: '/employees', icon: Users },
          { label: 'Departments', path: '/departments', icon: FolderPlus },
          { label: 'Shifts', path: '/shifts', icon: Clock },
          { label: 'Attendance', path: '/attendance', icon: Activity },
          { label: 'Leave approvals', path: '/leaves', icon: Calendar },
          { label: 'Payroll', path: '/payroll', icon: FileText },
          { label: 'Documents', path: '/documents', icon: FileText },
          { label: 'Interviews', path: '/interviews', icon: Calendar },
          { label: 'Performance', path: '/performance', icon: Award }
        ];
      case 'MANAGER':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: BarChart },
          { label: 'Team Employees', path: '/employees', icon: Users },
          { label: 'Team Attendance', path: '/attendance', icon: Activity },
          { label: 'Leave approvals', path: '/leaves', icon: Calendar },
          { label: 'Interviews', path: '/interviews', icon: Calendar },
          { label: 'Performance', path: '/performance', icon: Award }
        ];
      case 'EMPLOYEE':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: BarChart },
          { label: 'My Profile', path: '/profile', icon: UserIcon },
          { label: 'My Attendance', path: '/attendance', icon: Clock },
          { label: 'My Leaves', path: '/leaves', icon: Calendar },
          { label: 'My Payslips', path: '/payslips', icon: FileText },
          { label: 'My Documents', path: '/documents', icon: FileText },
          { label: 'Performance Review', path: '/performance', icon: Award }
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();
  const RoleIcon = ROLE_ICONS[user?.role] || UserIcon;

  return (
    <div className="app-shell">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-mobile-overlay ${!sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(true)}
      />

      {/* Sidebar */}
      <aside className={`app-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Layers size={14} className="text-white" />
          </div>
          <span className="sidebar-logo-text">WorkflowPro</span>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">General</span>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || 
              (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="link-icon" size={17} />
                <span className="link-label">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-link w-full text-left" style={{ border: 'none', background: 'none' }}>
            <LogOut className="link-icon" size={17} />
            <span className="link-label">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="app-main">
        {/* Top Navbar */}
        <header className="app-topnav">
          <button className="topnav-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={18} />
          </button>
          
          <div className="topnav-breadcrumbs">
            <Breadcrumbs />
          </div>

          <div className="topnav-actions">
            {/* Notifications Bell */}
            {user?.role !== 'SUPER_ADMIN' && (
              <div className="relative" ref={notifRef}>
                <button className="topnav-icon-btn" onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}>
                  <Bell size={17} />
                  {unreadCount > 0 && <span className="topnav-badge" />}
                </button>

                {notifDropdownOpen && (
                  <div className="dropdown-menu" style={{ width: '280px', padding: '8px 0' }}>
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Notifications</span>
                      {unreadCount > 0 && <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 500 }}>{unreadCount} new</span>}
                    </div>

                    <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                      {loadingNotifs && notifications.length === 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}><Spinner /></div>
                      ) : notifications.length === 0 ? (
                        <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                          No notifications
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n._id} 
                            onClick={() => markAsRead(n._id)}
                            className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                            style={{ cursor: 'pointer' }}
                          >
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '12.5px', fontWeight: !n.isRead ? 600 : 500, margin: 0, color: 'var(--text-primary)' }}>
                                {n.title}
                              </p>
                              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                                {n.message}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '6px 8px 0', textAlign: 'center' }}>
                      <Link to="/notifications" onClick={() => setNotifDropdownOpen(false)} style={{ fontSize: '11.5px', color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              >
                <div className="avatar">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }} className="hidden sm:flex">
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                    {user?.name}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {profileDropdownOpen && (
                <div className="dropdown-menu">
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{user?.name}</p>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', fontSize: '11px', fontWeight: 600, color: 'var(--accent)' }}>
                    <RoleIcon size={12} />
                    <span>{user?.role?.replace('_', ' ')}</span>
                  </div>
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item danger">
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
