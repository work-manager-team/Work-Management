import React, { useState } from 'react';
import { Facebook, MessageCircle, ArrowLeft } from 'lucide-react';
import { websocketService } from '../services/websocket.service';

interface LoginPageProps {
  onLogin: () => void;
}


const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  // Forgot Password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Email, 2: OTP + Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  const handleSubmit = async () => {
    if (isLogin) {
      try {
        const response = await fetch(
          "https://work-management-chi.vercel.app/users/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              emailOrUsername: username,
              password: password,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          console.log("Login success:", data);

          // Lưu user và token vào localStorage
          localStorage.setItem("user", JSON.stringify(data.user));
          if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
          }

          // 🔌 Kết nối WebSocket ngay sau khi login thành công
          console.log('🚀 Kết nối WebSocket sau login...');
          await websocketService.connect();

          onLogin(); // gọi callback từ props
        } else {
          alert(data.message || "Login failed");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred. Please try again.");
      }
    } else {
      // Đăng ký (Register)
      try {
        // Gọi API đăng ký
        const registerResponse = await fetch(
          "https://work-management-chi.vercel.app/users",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              username: username,
              password: password,
              fullName: fullName || "Test User",
            }),
          }
        );

        const registerData = await registerResponse.json();

        if (registerResponse.ok) {
          console.log("Register success:", registerData);

          // Gọi API xác thực email
          try {
            const verifyResponse = await fetch(
              "https://work-management-chi.vercel.app/auth/resend-verification",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: email,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              console.log("Verification email sent:", verifyData);
              alert("Registration successful! Please check your email to verify your account.");
              setUsername('');
              setEmail('');
              setPassword('');
              setFullName('');
              setIsLogin(true);
            } else {
              console.warn("Verification email could not be sent:", verifyData);
              alert("Registration successful! Please check your email to verify your account.");
              setUsername('');
              setEmail('');
              setPassword('');
              setFullName('');
              setIsLogin(true);
            }
          } catch (verifyError) {
            console.error("Verification error:", verifyError);
            alert("Registration successful! Please check your email to verify your account.");
            setUsername('');
            setEmail('');
            setPassword('');
            setFullName('');
            setIsLogin(true);
          }
        } else {
          alert(registerData.message || "Registration failed");
        }
      } catch (error) {
        console.error("Register error:", error);
        alert("An error occurred during registration. Please try again.");
      }
    }
  };

  const handleForgotPasswordEmail = async () => {
    if (!forgotEmail.trim()) {
      setForgotPasswordError('Please enter your email');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    try {
      const response = await fetch(
        "https://work-management-chi.vercel.app/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: forgotEmail,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordSuccess('OTP sent to your email. Please check your inbox.');
        setForgotPasswordStep(2);
      } else {
        setForgotPasswordError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setForgotPasswordError('An error occurred. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim()) {
      setForgotPasswordError('Please enter OTP');
      return;
    }

    if (!newPassword.trim()) {
      setForgotPasswordError('Please enter new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotPasswordError('Passwords do not match');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    try {
      const response = await fetch(
        "https://work-management-chi.vercel.app/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: forgotEmail,
            otp: otp,
            newPassword: newPassword,
            confirmPassword: confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordSuccess('Password reset successfully! Returning to login...');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordStep(1);
          setForgotEmail('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setForgotPasswordError('');
          setForgotPasswordSuccess('');
        }, 2000);
      } else {
        setForgotPasswordError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setForgotPasswordError('An error occurred. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep(1);
    setForgotEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo và Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-500 mb-2">Jira</h1>
          <p className="text-purple-400 text-lg">
            {isLogin ? 'Login to continue' : 'Register to get started'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="Enter your username"
            />
          </div>

          {/* Email (chỉ hiển thị khi Register) */}
          {!isLogin && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Enter your email"
              />
            </div>
          )}

          {/* Full Name (chỉ hiển thị khi Register) */}
          {!isLogin && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Full Name:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Enter your full name"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="Enter your password"
            />
          </div>

          {/* Forgot Password (chỉ hiển thị khi Login) */}
          {isLogin && (
            <div className="text-right">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-purple-500 hover:text-purple-600"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-full transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </div>

        {/* Toggle Login/Register */}
        <div className="text-center mt-6">
          <p className="text-gray-700 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-500 hover:text-purple-600 font-semibold"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>



      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-purple-500">Reset Password</h2>
              <button
                onClick={closeForgotPassword}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft size={24} className="transform rotate-180" />
              </button>
            </div>

            {/* Step 1: Email */}
            {forgotPasswordStep === 1 && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">
                  Enter your email address and we'll send you an OTP to reset your password.
                </p>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Email:
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Enter your email"
                  />
                </div>

                {forgotPasswordError && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {forgotPasswordError}
                  </div>
                )}

                <button
                  onClick={handleForgotPasswordEmail}
                  disabled={forgotPasswordLoading}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-full transition duration-200 shadow-lg hover:shadow-xl"
                >
                  {forgotPasswordLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            )}

            {/* Step 2: OTP & Password */}
            {forgotPasswordStep === 2 && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">
                  Enter the OTP sent to your email and your new password.
                </p>

                {forgotPasswordSuccess && (
                  <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                    {forgotPasswordSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    OTP:
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Enter OTP"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    New Password:
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Confirm Password:
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Confirm password"
                  />
                </div>

                {forgotPasswordError && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {forgotPasswordError}
                  </div>
                )}

                <button
                  onClick={handleResetPassword}
                  disabled={forgotPasswordLoading}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-full transition duration-200 shadow-lg hover:shadow-xl"
                >
                  {forgotPasswordLoading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button
                  onClick={() => setForgotPasswordStep(1)}
                  className="w-full border border-purple-500 text-purple-500 hover:bg-purple-50 font-semibold py-3 rounded-full transition duration-200"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;