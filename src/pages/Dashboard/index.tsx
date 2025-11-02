import React from "react";

const Dashboard = () => {
    const username = "admin";

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>Chào mừng {username}!</h1>
            <p>Bạn đã đăng nhập thành công </p>
        </div>
    );
};

export default Dashboard;
