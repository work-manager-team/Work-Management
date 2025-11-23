import React, { useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import TaskCard from './TaskCard';
import './Board.css';

interface Task {
  id: string;
  title: string;
  description?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const Board: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        {
          id: '1',
          title: 'Redesign Trello dashboard',
          description: '',
        },
      ],
    },
    {
      id: 'doing',
      title: 'Doing',
      tasks: [
        {
          id: '2',
          title: 'Redesigning Trello dashboard',
          description: '',
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        {
          id: '3',
          title: 'Redesigned Trello dashboard',
          description: '',
        },
      ],
    },
  ]);

  const [draggedTask, setDraggedTask] = useState<{ taskId: string; sourceColumnId: string } | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string, columnId: string) => {
    setDraggedTask({ taskId, sourceColumnId: columnId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    if (!draggedTask) return;

    const { taskId, sourceColumnId } = draggedTask;

    if (sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((col) => ({ ...col }));

      // Find source and target columns
      const sourceColumn = newColumns.find((col) => col.id === sourceColumnId);
      const targetColumn = newColumns.find((col) => col.id === targetColumnId);

      if (sourceColumn && targetColumn) {
        // Find and remove task from source
        const taskIndex = sourceColumn.tasks.findIndex((task) => task.id === taskId);
        if (taskIndex > -1) {
          const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);
          // Add task to target
          targetColumn.tasks.push(movedTask);
        }
      }

      return newColumns;
    });

    setDraggedTask(null);
  };

  const handleAddTask = (columnId: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'New Task',
      description: '',
    };

    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
      )
    );
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <h1 className="board-title">My Board</h1>
        <div className="board-actions">
          <button className="board-btn-secondary">My Design</button>
        </div>
      </div>

      <div className="columns-grid">
        {columns.map((column) => (
          <div key={column.id} className="column">
            <div className="column-header">
              <h2 className="column-title">{column.title}</h2>
              <button className="column-menu">
                <MoreVertical size={18} />
              </button>
            </div>

            <div
              className="tasks-container"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id, column.id)}
                  className="task-wrapper"
                >
                  <TaskCard task={task} />
                </div>
              ))}
            </div>

            <button className="add-card-btn" onClick={() => handleAddTask(column.id)}>
              <Plus size={16} />
              Add a card
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
