import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu')
      return
    }
    setLoading(true)
    // Mock login delay
    setTimeout(() => {
      // In real app, call API and store real token
      localStorage.setItem('authToken', 'mock-token')
      setLoading(false)
      navigate('/')
    }, 700)
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Đăng nhập</h2>
        {error && <div className="error">{error}</div>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Đang...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}

export default Login
