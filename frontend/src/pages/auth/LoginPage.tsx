import React, { useState } from 'react';
import { Facebook, MessageCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import userAuthService from '../../services/user/auth.service';


interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  //state cho gửi lại mail
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!emailOrUsername.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setNeedsVerification(false);

    try {
      const response = await userAuthService.login({
        emailOrUsername: emailOrUsername.trim(),
        password: password.trim(),
      });

      console.log('Login success:', response);
      
      // Call onLogin callback
      onLogin();
      
      // Navigate to dashboard
      // navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      
      setError(err.message || 'Login failed. Please try again.');
      if (err.message === "Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hộp thư của bạn.") {
        setNeedsVerification(true);
        //auto-fill email nếu user nhập email
        if (emailOrUsername.includes('@')) {
            setResendEmail(emailOrUsername.trim());
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  // handle resend VerificationEmail
  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resendEmail.trim() || !resendEmail.includes('@')) {
        setResendMessage('Email không hợp lệ');
        return;
    }
    // Basic email validation
    if (!resendEmail.includes('@')) {
      setResendMessage('Email không hợp lệ');
      return;
    }
    setResending(true);
    setResendMessage('');
    setResendSuccess(false);

    try {
        console.log('📤 Resending verification email to:', resendEmail);
        const response = await fetch(
            'https://work-management-chi.vercel.app/auth/resend-verification',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resendEmail.trim() }),
            }
        );

        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message);
        
        setResendSuccess(true);
        setResendMessage('Email xác thực đã được gửi lại! Vui lòng kiểm tra hộp thư.');
        
        // Auto-close sau 5s
        setTimeout(() => {
            setShowResendForm(false);
            setResendEmail('');
            setResendMessage('');
            setResendSuccess(false);
        }, 5000);
        
    } catch (error: any) {
        setResendMessage(error.message || 'Gửi lại thất bại');
        setResendSuccess(false);
    } finally {
        setResending(false);
    }
  };

 

  return (
    <div className="min-h-screen bg-purple-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo và Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-500 mb-2">Jira</h1>
          <p className="text-purple-400 text-lg">Login to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}
        {/* ✅ NEW: Resend Verification Section */}
        {needsVerification && (
          <div className="mb-4">
            {!showResendForm ? (
              // Show button to open form
              <button
                onClick={() => setShowResendForm(true)}
                className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <p className="text-blue-700 text-sm font-medium text-center">
                   Bạn chưa nhận được email xác thực?{' '}
                  <span className="underline">Click vào đây để nhận mail xác thực</span>
                </p>
              </button>
            ) : (
              // Show resend form
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex justify-end mb-3">
                  <button
                    onClick={() => {
                      setShowResendForm(false);
                      setResendEmail('');
                      setResendMessage('');
                      setResendSuccess(false);
                    }}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                
                <form onSubmit={handleResendVerification} className="space-y-3">
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    required
                    disabled={resending || resendSuccess}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  />
                  
                  {resendMessage && (
                    <div className={`text-sm p-2 rounded ${
                      resendSuccess 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {resendMessage}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={resending || resendSuccess}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors text-sm"
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
                      'Đã gửi'
                    ) : (
                      'Gửi email xác thực'
                    )}
                  </button>
                </form>
                
                
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email or Username */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email or Username
            </label>
            <input
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="Enter your email or username"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
            <input
                type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="Enter your password"
                disabled={loading}
            />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
            <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-purple-500 hover:text-purple-600"
            >
                Forgot password?
              </button>
            </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-full transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
          
        </form>

        {/* Toggle Login/Register */}
        <div className="text-center mt-6">
          <p className="text-gray-700 text-sm">
            Don't have an account?{' '}
            <button
              onClick={handleRegisterClick}
              className="text-purple-500 hover:text-purple-600 font-semibold"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;