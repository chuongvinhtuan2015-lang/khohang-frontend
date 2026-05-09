import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  Settings,
  LogOut,
  Search as SearchIcon,
  Bell,
  BarChart
} from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';

const Sidebar = () => {
  const { logout, isAdmin, user } = useAuth();

  let menuItems = [
    { name: 'Tổng quan', icon: LayoutDashboard, path: '/' },
    { name: 'Sản phẩm', icon: Package, path: '/products' },
    { name: 'Nhập kho', icon: ArrowDownLeft, path: '/import' },
    { name: 'Xuất kho', icon: ArrowUpRight, path: '/export' },
  ];

  if (isAdmin() || (user && (user.role === 'ADMIN' || user.role === 'MANAGER'))) {
    menuItems.push({ name: 'Nhân viên', icon: Users, path: '/users' });
    menuItems.push({ name: 'Báo cáo', icon: BarChart, path: '/reports' });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Package size={20} />
        </div>
        <h1>KHO HÀNG <span>PRO</span></h1>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} className="sidebar-link-icon" />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isAdmin() && (
          <Link to="/settings" className="sidebar-link">
            <Settings size={18} className="sidebar-link-icon" />
            <span>Cài đặt</span>
          </Link>
        )}
        <button className="sidebar-logout" onClick={logout}>
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [showPassModal, setShowPassModal] = React.useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Tổng quan';
    if (path === '/products') return 'Sản phẩm';
    if (path === '/import') return 'Nhập kho';
    if (path === '/export') return 'Xuất kho';
    if (path === '/users') return 'Nhân viên';
    if (path === '/reports') return 'Báo cáo & Thống kê';
    if (path === '/security') return 'Trung tâm Bảo mật';
    return 'Trang chủ';
  };

  const roleLabel = (role) => {
    if (role === 'ADMIN') return 'Quản trị viên';
    if (role === 'MANAGER') return 'Quản lý kho';
    if (role === 'STAFF') return 'Nhân viên kho';
    return role;
  };

  return (
    <header className="header">
      <h2 className="header-title">{getPageTitle()}</h2>

      <div className="header-right">
        <div className="header-divider"></div>

        <div className="header-user" onClick={() => setShowPassModal(true)} style={{ cursor: 'pointer' }}>
          <div className="header-user-info">
            <p className="header-user-name">{user?.full_name || user?.username || 'Guest'}</p>
            <p className="header-user-role">{roleLabel(user?.role)}</p>
          </div>
          <div className="header-avatar">
            {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : (user?.username || 'GU').substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
      {showPassModal && <ChangePasswordModal onClose={() => setShowPassModal(false)} />}
    </header>
  );
};

const MainLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <main className="main-content">
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
