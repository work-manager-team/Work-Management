import React from 'react';
import Sidebar from './Sidebar/Sidebar';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import { useState, useEffect} from 'react';
import './layout.css';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
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
    <div className="layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="layout-main"
      >
        {/* Header */}
        <Header onLogout={onLogout} />

        {/* Content */}
        <main className="layout-content"
        
      
        >
          {children}
        </main>

        {/* Footer (Optional - có thể ẩn nếu không cần) */}
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default Layout;