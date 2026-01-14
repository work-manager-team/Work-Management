import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Table, 
  Folder, 
  Users, 
  Calendar, 
  Bell, 
  Settings ,
  ChartNoAxesCombined
} from 'lucide-react';
import './sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: Table, label: 'Dashboard' },
    { path: '/projects', icon: Folder, label: 'Projects' },
    { path: '/boards', icon: Table, label: 'Boards' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/reports', icon: ChartNoAxesCombined, label: 'Reports' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link to="/dashboard" className="sidebar-logo">
        Jira
      </Link>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span className="sidebar-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
