import React from 'react';
import './Header.css';

const Header: React.FC = () => {
    return (
        <header className="header">
            <input
                type="text"
                className="search-box"
                placeholder="Search issues, projects..."
            />
            <img
                src="https://i.pravatar.cc/40" // ảnh đại diện tạm thời
                alt="Profile"
                className="profile-img"
            />
        </header>
    );
};

export default Header;
