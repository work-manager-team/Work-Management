import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login/index.tsx';
import Dashboard from './pages/Dashboard/index.tsx';
import MainLayout from './layout/Mainlayout/Mainlayout.tsx';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>

                <Route path="/login" element={<Login setIsLoggedIn={() => { }} />} />


                <Route
                    path="/"
                    element={
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    }
                />


                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
