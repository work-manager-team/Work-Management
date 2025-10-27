import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1>Chào mừng bạn đã đăng nhập thành công!</h1>
            <button onClick={handleLogout}>Đăng xuất</button>
        </div>
    );
};

export default Home;
