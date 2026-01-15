import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

interface ForgotPasswordResponse {
  statusCode: number;
  message: string;
  token: string;
  userId: number;
  email: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Bước 1: Gửi email để nhận token
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://work-management-chi.vercel.app/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data: ForgotPasswordResponse = await response.json();

      if (response.ok) {
        // Lưu token vào localStorage (do backend chưa gửi mail được)
        localStorage.setItem('resetPasswordToken', data.token);
        localStorage.setItem('resetPasswordEmail', data.email);
        
        // Chuyển sang bước nhập mật khẩu mới
        setStep('reset');
      } else {
        setError(data.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Đặt lại mật khẩu mới
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate mật khẩu
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('resetPasswordToken');
      
      if (!token) {
        setError('Token không hợp lệ, vui lòng thử lại');
        setStep('email');
        return;
      }

      const response = await fetch('https://work-management-chi.vercel.app/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Xóa token khỏi localStorage
        localStorage.removeItem('resetPasswordToken');
        localStorage.removeItem('resetPasswordEmail');
        
        // Thông báo thành công
        alert('Đã tạo mật khẩu mới thành công');
        
        // Điều hướng về trang Login
        navigate('/forgot-password');
      } else {
        setError(data.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {step === 'email' ? (
          // Form nhập email
          <>
            <h2>Quên mật khẩu</h2>
            <p className="description">
              Nhập địa chỉ email của bạn để nhận link đặt lại mật khẩu
            </p>
            
            <form onSubmit={handleSendEmail}>
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  required
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Đang gửi...' : 'Gửi'}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Quay lại đăng nhập
              </button>
            </form>
          </>
        ) : (
          // Form nhập mật khẩu mới
          <>
            <h2>Đặt lại mật khẩu</h2>
            <p className="description">
              Nhập mật khẩu mới cho tài khoản {localStorage.getItem('resetPasswordEmail')}
            </p>
            
            <form onSubmit={handleResetPassword}>
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep('email')}
                disabled={loading}
              >
                Quay lại
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;