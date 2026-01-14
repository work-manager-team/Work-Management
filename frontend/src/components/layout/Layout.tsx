import React from 'react';
import Sidebar from './Sidebar/Sidebar';
import Header from './Header/Header';
import Footer from './Footer/Footer';

import './layout.css';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  
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