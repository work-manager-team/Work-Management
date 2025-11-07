import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from './pages/Login/index.tsx';
import Dashboard from './pages/Dashboard/index.tsx';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setIsLoggedIn(true);
    }, []);

    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/login"
                    element={
                        isLoggedIn ? (
                            <Navigate to="/" replace />
                        ) : (
                            <Login setIsLoggedIn={setIsLoggedIn} />
                        )
                    }
                />


                <Route
                    path="/"
                    element={
                        isLoggedIn ? (
                            <Dashboard />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
