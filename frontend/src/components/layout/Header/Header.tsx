import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, Plus, Search } from 'lucide-react';
import './header.css';
import CreateProjectModal from '../../../pages/projects/components/CreateProjectModal';
import CreateTaskModal from './CreateTaskModal';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout();
  };

  const handleProjectCreated = () => {
    setShowProjectModal(false);
  };

  const handleCreateTask = () => {
    setShowCreateMenu(false);
    setShowTaskModal(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // TODO: Implement search functionality
  };

  
    const [avatarUrl, setAvatarUrl] = useState<string>('');

    useEffect(() => {
        fetchAvatarUrl();
    }, []);

    const fetchAvatarUrl = async () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                const token = localStorage.getItem('accessToken');
                if (token) {
                    const response = await fetch(
                        `https://work-management-chi.vercel.app/users/${user.id}/avatar`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    if (response.ok) {
                        const data = await response.json();
                        if (data.avatar?.url) {
                            setAvatarUrl(data.avatar.url);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching avatar:', error);
        }
    };

  return (
    <header className="header">
      {/* Right Side - Actions */}
      <div className="header-right">
        
        {/* Create Button */}
        <div className="header-create-menu">
          <button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="header-create-button"
          >
            <Plus size={20} />
            Create
          </button>

          {showCreateMenu && (
            <div className="header-create-dropdown">
              <button
                className="header-create-dropdown-item"
                onClick={() => setShowProjectModal(true)}
              >
                <span>Project</span>
              </button>
              <button
                className="header-create-dropdown-item"
                onClick={handleCreateTask}
              >
                <span>Task</span>
              </button>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="header-user-menu">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="header-user-button"
          >
            <div className="flex items-center justify-center bg-purple-500 text-white w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
            <User size={20} />
                                    )}
            </div>
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

      {/* Create Project Modal */}
      {showProjectModal && (
        <CreateProjectModal
          onClose={() => setShowProjectModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <CreateTaskModal
          onClose={() => setShowTaskModal(false)}
          onTaskCreated={() => setShowTaskModal(false)}
        />
      )}
    </header>
  );
};

export default Header;