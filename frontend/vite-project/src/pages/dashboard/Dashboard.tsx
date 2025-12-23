// pages/dashboard/Dashboard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Star, Users, MoreHorizontal } from 'lucide-react';

// Import components
/*
import KanbanBoard from './components/KanbanBoard';
import PopularTemplates from './components/PopularTemplates';
import WorkspaceInfo from './components/WorkspaceInfo';
import CreateBoardButton from './components/CreateBoardButton';
*/
// Import types
import { Column } from '../../models/Board';

// Import styles
import './dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      cards: [{ id: '1', title: 'Redesign Trello dashboard' }]
    },
    {
      id: 'doing',
      title: 'Doing',
      cards: [{ id: '2', title: 'Redesigning Trello dashboard' }]
    },
    {
      id: 'done',
      title: 'Done',
      cards: [{ id: '3', title: 'Redesigned Trello dashboard' }]
    }
  ]);

  // Handlers
  const handleCreateBoard = () => {
    console.log('Create new board');
    // TODO: Open create board modal
  };

  const handleInviteMembers = () => {
    console.log('Invite members');
    // TODO: Open invite members modal
  };

  const handleAddCard = (columnId: string) => {
    console.log('Add card to column:', columnId);
    // TODO: Implement add card logic
  };

  const handleAddColumn = () => {
    console.log('Add new column');
    // TODO: Implement add column logic
  };

  return (
    <div className="dashboard-container">
      {/* Create Board Button */}
      <CreateBoardButton onClick={handleCreateBoard} />

      {/* Invite Members Button */}
      <button 
        onClick={handleInviteMembers}
        className="invite-button"
      >
        <Users size={18} />
        <span>Invite Workspace members</span>
      </button>

      {/* Board Section */}
      <section className="board-section">
        <h2 className="section-title">My Board</h2>
        
        {/* Board Controls */}
        <div className="board-controls">
          <span className="board-name">My Design</span>
          <button className="icon-button">
            <Star size={18} />
          </button>
          <button className="icon-button">
            <Users size={18} />
          </button>
          <button className="board-dropdown-button">
            <span>Board</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4z"/>
            </svg>
          </button>
        </div>

        {/* Kanban Board */}
        <KanbanBoard
          columns={columns}
          onAddCard={handleAddCard}
          onAddColumn={handleAddColumn}
        />
      </section>

      {/* Popular Templates Section */}
      <PopularTemplates />

      {/* Workspace Info */}
      <WorkspaceInfo />
    </div>
  );
};

export default Dashboard;