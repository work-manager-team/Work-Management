import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    const location = useLocation();

    return (
        <aside className="sidebar">
            <h2>JIRA</h2>
            <ul>
                <li className={location.pathname === '/dashboard' ? 'active' : ''}>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
                <li className={location.pathname === '/projects' ? 'active' : ''}>
                    <Link to="/projects">Projects</Link>
                </li>
                <li className={location.pathname === '/boards' ? 'active' : ''}>
                    <Link to="/boards">Boards</Link>
                </li>
                <li className={location.pathname === '/reports' ? 'reports' : ''}>
                    <Link to="/reports">Reports</Link>
                </li>
                <li className={location.pathname === '/settings' ? 'active' : ''}>
                    <Link to="/settings">Settings</Link>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;
