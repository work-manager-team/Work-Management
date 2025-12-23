import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, User, LogOut } from 'lucide-react';
import './header.css';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout();
  };

  return (
    <header className="header">
      {/* Left Side - Navigation */}
      <div className="header-left">
        <button className="header-nav-button">
          <span>Workspace</span>
          <ChevronDown size={16} />
        </button>
        <button className="header-nav-button">
          <span>Recent</span>
          <ChevronDown size={16} />
        </button>
        <button className="header-nav-button">
          <span>Starred</span>
          <ChevronDown size={16} />
        </button>
        <button className="header-nav-button">
          <span>Templates</span>
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Right Side - Actions */}
      <div className="header-right">
        {/* Search */}
        <input
          type="text"
          placeholder="Search"
          className="header-search"
        />

        {/* Create Button */}
        <button className="header-create-button">
          Create
        </button>

        {/* Premium Button */}
        <button className="header-premium-button">
          <span>⚡</span>
          <span>Try Premium</span>
        </button>

        {/* User Menu */}
        <div className="header-user-menu">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="header-user-button"
          >
            <User size={20} />
          </button>

          {showUserMenu && (
            <div className="header-user-dropdown">
              <Link
                to="/profile"
                className="header-user-dropdown-item"
                onClick={() => setShowUserMenu(false)}
              >
                <User size={18} />
                <span>View Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="header-user-dropdown-item logout"
              >
                <LogOut size={18} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;