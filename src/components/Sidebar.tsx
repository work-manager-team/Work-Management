import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaProjectDiagram, FaColumns, FaRegChartBar, FaCog } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    const location = useLocation();

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-img">G16</div>
                <div className="brand-text">GROUP 16</div>
            </div>

            <ul>
                <li className={location.pathname === '/dashboard' ? 'active' : ''}>
                    <Link to="/dashboard">
                        <span className="icon"><FaTachometerAlt /></span>
                        <span className="label">Dashboard</span>
                    </Link>
                </li>

                <li className={location.pathname === '/projects' ? 'active' : ''}>
                    <Link to="/projects">
                        <span className="icon"><FaProjectDiagram /></span>
                        <span className="label">Projects</span>
                    </Link>
                </li>

                <li className={location.pathname === '/boards' ? 'active' : ''}>
                    <Link to="/boards">
                        <span className="icon"><FaColumns /></span>
                        <span className="label">Boards</span>
                    </Link>
                </li>

                <li className={location.pathname === '/reports' ? 'reports' : ''}>
                    <Link to="/reports">
                        <span className="icon"><FaRegChartBar /></span>
                        <span className="label">Reports</span>
                        <span className="badge">3</span>
                    </Link>
                </li>

                <li className={location.pathname === '/settings' ? 'active' : ''}>
                    <Link to="/settings">
                        <span className="icon"><FaCog /></span>
                        <span className="label">Settings</span>
                    </Link>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;
