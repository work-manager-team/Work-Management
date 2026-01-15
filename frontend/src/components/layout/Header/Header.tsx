import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, Plus, Search } from 'lucide-react';
import './header.css';
import CreateProjectModal from '../../../pages/projects/components/CreateProjectModal';
import CreateTaskModal from './CreateTaskModal';
import Toast from '../../../pages/Toast';
import { useNotification } from '../../../context/NotificationContext';
import { websocketService } from '../../../services/user/websocket.service';

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
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isReconnecting, setIsReconnecting] = useState(false);

  const { toasts, removeToast } = useNotification();

  // ✅ MỚI: Refs để detect click outside
  const userMenuRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAvatarUrl();
  }, []);

  // ✅ MỚI: Handle click outside để đóng dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Đóng User Menu nếu click bên ngoài
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }

      // Đóng Create Menu nếu click bên ngoài
      if (
        createMenuRef.current &&
        !createMenuRef.current.contains(event.target as Node)
      ) {
        setShowCreateMenu(false);
      }
    };

    // Thêm event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  return (
    <>
      <header className="header">
        {/* Right Side - Actions */}
        <div className="header-right">
          
          {/* Create Button */}
          <div className="header-create-menu" ref={createMenuRef}>
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
                  onClick={() => {
                    setShowCreateMenu(false);
                    setShowProjectModal(true);
                  }}
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
          <div className="header-user-menu" ref={userMenuRef}>
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

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 flex flex-col gap-3 z-50 max-w-md">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
            duration={5000}
          />
        ))}
      </div>
    </>
  );
};

export default Header;