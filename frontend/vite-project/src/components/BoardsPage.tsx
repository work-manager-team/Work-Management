import React, { useState } from 'react';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';
import Layout from './Layout';

interface Task {
    id: string;
    title: string;
    description: string;
    dueDate?: string;
    priority: 'high' | 'medium' | 'low';
    assignee?: string;
    tag?: string;
}

interface BoardColumn {
    id: string;
    title: string;
    tasks: Task[];
}

interface BoardsPageProps {
    onLogout: () => void;
}

const BoardsPage: React.FC<BoardsPageProps> = ({ onLogout }) => {
    const [selectedProject, setSelectedProject] = useState('project-1');
    const [searchQuery, setSearchQuery] = useState('');
    const [draggedTask, setDraggedTask] = useState<{ columnId: string; taskId: string } | null>(null);
    const [columns, setColumns] = useState<BoardColumn[]>([
        {
            id: 'todo',
            title: 'TO DO',
            tasks: [
                {
                    id: 'task-1',
                    title: 'Setup project structure',
                    description: 'Initialize project with basic folders',
                    priority: 'high',
                    tag: 'Setup'
                },
                {
                    id: 'task-2',
                    title: 'Create database schema',
                    description: 'Design and create database tables',
                    priority: 'high',
                    tag: 'Database'
                }
            ]
        },
        {
            id: 'inprogress',
            title: 'IN PROGRESS',
            tasks: [
                {
                    id: 'task-3',
                    title: 'Implement authentication',
                    description: 'Add login and registration',
                    priority: 'high',
                    tag: 'Feature',
                    dueDate: 'Dec 20, 2025'
                }
            ]
        },
        {
            id: 'done',
            title: 'DONE',
            tasks: [
                {
                    id: 'task-4',
                    title: 'Design UI mockups',
                    description: 'Create wireframes and mockups',
                    priority: 'medium',
                    tag: 'Design'
                }
            ]
        },
        {
            id: 'notcompleted',
            title: 'NOT COMPLETED',
            tasks: [
                {
                    id: 'task-5',
                    title: 'Test API via Postman',
                    description: 'Verify API endpoints and documentation',
                    dueDate: 'Nov 1, 2025',
                    priority: 'high',
                    tag: 'KAN-11'
                }
            ]
        }
    ]);

    const projects = [
        { id: 'project-1', name: 'Project Alpha' },
        { id: 'project-2', name: 'Project Beta' },
        { id: 'project-3', name: 'Project Gamma' }
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-50';
            case 'medium':
                return 'text-yellow-600 bg-yellow-50';
            case 'low':
                return 'text-green-600 bg-green-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const handleDragStart = (columnId: string, taskId: string) => {
        setDraggedTask({ columnId, taskId });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-purple-50');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('bg-purple-50');
    };

    const handleDrop = (targetColumnId: string, e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-purple-50');

        if (!draggedTask) return;

        // Nếu drop vào column cùng vị trí thì không làm gì
        if (draggedTask.columnId === targetColumnId) {
            setDraggedTask(null);
            return;
        }

        // Tìm task cần move
        let draggedTaskData: Task | null = null;

        const newColumns = columns
            .map(col => {
                if (col.id === draggedTask.columnId) {
                    const taskIndex = col.tasks.findIndex(t => t.id === draggedTask.taskId);
                    if (taskIndex !== -1) {
                        draggedTaskData = col.tasks[taskIndex];
                        return {
                            ...col,
                            tasks: col.tasks.filter((t) => t.id !== draggedTask.taskId) as Task[]
                        };
                    }
                }
                return col;
            })
            .map(col =>
                col.id === targetColumnId && draggedTaskData
                    ? { ...col, tasks: [...col.tasks, draggedTaskData] as Task[] }
                    : col
            );

        setColumns(newColumns);
        setDraggedTask(null);
    };

    const handleAddTask = (columnId: string) => {
        const newTask: Task = {
            id: `task-${Date.now()}`,
            title: 'New Task',
            description: '',
            priority: 'medium'
        };

        setColumns(columns.map(col =>
            col.id === columnId
                ? { ...col, tasks: [...col.tasks, newTask] }
                : col
        ));
    };

    return (
        <Layout onLogout={onLogout}>
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-4">
                        {/* Search and Filter */}
                        <div className="flex items-center gap-3 flex-1">
                            <div className="relative flex-1 max-w-xs">
                                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search board"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                <Filter size={18} />
                                <span>Filter</span>
                            </button>
                        </div>

                        {/* Project Selector */}
                        <div className="flex items-center gap-2 relative group">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                <span className="text-sm font-medium text-gray-700">
                                    {projects.find(p => p.id === selectedProject)?.name}
                                </span>
                                <ChevronDown size={16} className="text-gray-600" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-40 hidden group-hover:block">
                                {projects.map(project => (
                                    <button
                                        key={project.id}
                                        onClick={() => setSelectedProject(project.id)}
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedProject === project.id ? 'bg-purple-50 text-purple-600' : 'text-gray-700'}`}
                                    >
                                        {project.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kanban Board */}
                <div className="flex-1 overflow-x-auto bg-gray-100 rounded-lg p-4">
                    <div className="flex gap-6 h-full">
                        {columns.map(column => (
                            <div
                                key={column.id}
                                className="flex-shrink-0 w-80 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col"
                            >
                                {/* Column Header */}
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700">
                                        {column.title}
                                        {column.title === 'DONE' && <span className="ml-2">✓</span>}
                                        {column.id === 'notcompleted' && <span className="ml-2 text-red-500">{column.tasks.length}</span>}
                                    </h3>
                                </div>

                                {/* Tasks List - Drop Zone */}
                                <div
                                    className="flex-1 overflow-y-auto p-3 space-y-3 transition-colors"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(column.id, e)}
                                >
                                    {column.tasks.map(task => (
                                        <div
                                            key={task.id}
                                            draggable
                                            onDragStart={() => handleDragStart(column.id, task.id)}
                                            className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition bg-white cursor-grab active:cursor-grabbing"
                                        >
                                            {task.dueDate && (
                                                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded inline-block mb-2 border border-red-200">
                                                    ⚠ {task.dueDate}
                                                </div>
                                            )}
                                            <h4 className="text-sm font-medium text-gray-800 mb-2">
                                                {task.title}
                                            </h4>
                                            <p className="text-xs text-gray-600 mb-2">
                                                {task.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(task.priority)}`}>
                                                    {task.tag || task.priority}
                                                </span>
                                                {task.priority === 'high' && (
                                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        G
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {column.tasks.length === 0 && (
                                        <div className="py-8 text-center text-gray-400 text-sm">
                                            Drag tasks here
                                        </div>
                                    )}
                                </div>

                                {/* Add Task Button */}
                                <div className="p-3 border-t border-gray-200">
                                    <button
                                        onClick={() => handleAddTask(column.id)}
                                        className="w-full flex items-center justify-center gap-2 py-2 text-gray-600 hover:text-purple-600 transition"
                                    >
                                        <Plus size={16} />
                                        <span className="text-sm font-medium">Add Task</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BoardsPage;
