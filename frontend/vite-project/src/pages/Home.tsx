import React from 'react'
import Board from '../components/Board'
import '../App.css'

function Home() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Work Manager</h1>
        <div className="header-actions">
          <button onClick={() => { localStorage.removeItem('authToken'); window.location.href = '/login' }}>Đăng xuất</button>
        </div>
      </header>

      <main className="board-main">
        <Board />
      </main>
    </div>
  )
}

export default Home
