import React from 'react'
import '../App.css'

const sampleTasks = [
  { id: 1, title: 'Thiết kế giao diện', status: 'Backlog' },
  { id: 2, title: 'Tạo API', status: 'To Do' },
  { id: 3, title: 'Bảng Kanban', status: 'In Progress' },
  { id: 4, title: 'Kiểm thử', status: 'Done' },
]

const statuses = ['Backlog', 'To Do', 'In Progress', 'Done']

function Home() {
  const grouped = statuses.map((s) => ({
    status: s,
    items: sampleTasks.filter((t) => t.status === s),
  }))

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Work Manager</h1>
        <div className="header-actions">
          <button onClick={() => { localStorage.removeItem('authToken'); window.location.href = '/login' }}>Đăng xuất</button>
        </div>
      </header>

      <main className="board">
        {grouped.map((col) => (
          <section key={col.status} className="column">
            <h3>{col.status}</h3>
            <div className="column-list">
              {col.items.length === 0 && <div className="empty">Không có task</div>}
              {col.items.map((task) => (
                <div key={task.id} className="card">
                  <div className="card-title">{task.title}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}

export default Home
