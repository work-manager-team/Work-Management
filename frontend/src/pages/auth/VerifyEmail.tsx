// src/pages/auth/VerifyEmail.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  
  // Resend email states
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

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

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resendEmail.trim()) {
      setResendMessage('Vui lòng nhập địa chỉ email');
      return;
    }

    setResending(true);
    setResendMessage('');
    setResendSuccess(false);

    try {
      console.log('📤 Resending verification email to:', resendEmail);
      
      const response = await fetch('http://localhost:3000/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend email');
      }

      console.log('✅ Email resent successfully');
      setResendSuccess(true);
      setResendMessage(data.message || 'Email xác thực đã được gửi lại! Vui lòng kiểm tra hộp thư.');
      
      // Clear form after 3 seconds
      setTimeout(() => {
        setShowResendForm(false);
        setResendEmail('');
        setResendMessage('');
        setResendSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error('❌ Resend failed:', error);
      setResendMessage(error.message || 'Gửi lại thất bại. Vui lòng thử lại.');
      setResendSuccess(false);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
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
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
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

            {/* Resend Email Section */}
            <div className="mt-6">
              {!showResendForm ? (
                // Button to show form
                <button
                  onClick={() => setShowResendForm(true)}
                  className="w-full bg-blue-50 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-100 font-medium transition-colors mb-4"
                >
                  Gửi lại email xác thực
                </button>
              ) : (
                // Resend form
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      Gửi lại email xác thực
                    </p>
                    <button
                      onClick={() => {
                        setShowResendForm(false);
                        setResendEmail('');
                        setResendMessage('');
                        setResendSuccess(false);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <form onSubmit={handleResendEmail} className="space-y-3">
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Nhập email của bạn"
                      required
                      disabled={resending}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    
                    {resendMessage && (
                      <div className={`text-sm p-2 rounded ${
                        resendSuccess 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {resendMessage}
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={resending || resendSuccess}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      {resending ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang gửi...
                        </span>
                      ) : resendSuccess ? (
                        '✓ Đã gửi'
                      ) : (
                        'Gửi email'
                      )}
                    </button>
                  </form>
                  
                  <p className="text-xs text-gray-500 mt-3">
                    💡 Kiểm tra cả thư mục spam/junk nếu không thấy email
                  </p>
                </div>
              )}
            </div>

            <Link
              to="/login"
              className="inline-block text-blue-600 hover:text-blue-500 font-medium mt-4"
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