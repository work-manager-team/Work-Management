// src/pages/auth/VerifyEmail.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import userAuthService from '../../services/user/auth.service';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    console.log('📧 VerifyEmail page loaded');
    console.log('Token from URL:', token);
    
    if (!token) {
      console.error('❌ No token in URL');
      setStatus('error');
      setMessage('Token xác thực không hợp lệ');
      return;
    }

    // Remove trailing dots if any
    const cleanToken = token.trim().replace(/\.+$/, '');
    console.log('Clean token length:', cleanToken.length);
    
    verifyEmail(cleanToken);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    console.log('🔄 Starting verification...');
    setStatus('verifying');
    
    try {
      console.log('📤 Calling verify API...');
      
      // Gọi API verify email
      const response = await fetch('http://localhost:3000/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }
      
      console.log('✅ Verification successful:', data);
      setStatus('success');
      setMessage(data.message || 'Email đã được xác thực thành công!');
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        console.log('➡️ Redirecting to login...');
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('❌ Verification failed:', error);
      
      setStatus('error');
      setMessage(
        error.message || 
        'Xác thực thất bại. Token có thể đã hết hạn hoặc không hợp lệ.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        
        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đang xác thực...
            </h2>
            <p className="text-gray-600">
              Vui lòng đợi trong giây lát
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Xác thực thành công!
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Bạn sẽ được chuyển đến trang đăng nhập trong 3 giây...
            </p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Xác thực thất bại
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>

            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;