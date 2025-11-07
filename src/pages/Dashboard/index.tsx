import React from "react";

const Dashboard: React.FC = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const username = user?.username || "Người dùng";

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>Chào mừng {username}!</h1>
            <p>Bạn đã đăng nhập thành công </p>
        </div>
    );
};

export default Dashboard;
