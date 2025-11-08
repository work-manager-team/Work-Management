import React from 'react';
import Sidebar from '../../components/Sidebar.tsx';
import Header from '../../components/Header.tsx';
import { Outlet } from 'react-router-dom';
import './Mainlayout.css';
interface MainLayoutProps {
    children: React.ReactNode;
}

const Mainlayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="layout">
            <Sidebar />
            <div className="main-area">
                <Header />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Mainlayout;
