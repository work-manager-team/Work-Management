import React, { useState } from 'react';
import { Facebook, MessageCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import userAuthService from '../../services/user/auth.service';
//import './LoginPage.css';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!emailOrUsername.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
    alert('Forgot password feature coming soon!');
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    alert(`${provider} login coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center p-4">
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