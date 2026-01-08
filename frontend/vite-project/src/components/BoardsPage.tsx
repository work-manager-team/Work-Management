import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';
import Layout from './Layout';

interface Sprint {
    id: string;
    name: string;
    description?: string;
    status: 'planned' | 'active' | 'completed' | 'not_completed';
    startDate?: string;
    endDate?: string;
    projectId: string;
}

interface Project {
    id: string;
    name: string;
    userId?: string;
}

interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    status: 'todo' | 'in_progress' | 'done' | 'not_completed';
    sprintId: string;
    projectId: string;
    reporterId?: string;
    assigneeId?: string;
    type?: string;
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
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [selectedSprint, setSelectedSprint] = useState<string>('');
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [draggedTask, setDraggedTask] = useState<{ columnId: string; taskId: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [selectedColumnId, setSelectedColumnId] = useState<string>('');
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'high' | 'medium' | 'low',
        assigneeId: ''
    });
    const [columns, setColumns] = useState<BoardColumn[]>([
        { id: 'todo', title: 'TO DO', tasks: [] },
        { id: 'in_progress', title: 'IN PROGRESS', tasks: [] },
        { id: 'done', title: 'DONE', tasks: [] },
        { id: 'not_completed', title: 'NOT COMPLETED', tasks: [] }
    ]);

    // Fetch projects on component mount
    useEffect(() => {
        fetchProjects();
    }, []);

    // Fetch sprints when project is selected
    useEffect(() => {
        if (selectedProject) {
            fetchSprints(selectedProject);
        }
    }, [selectedProject]);

    // Fetch tasks when sprint is selected
    useEffect(() => {
        if (selectedSprint) {
            fetchTasks(selectedSprint);
        } else if (sprints.length > 0) {
            // If no sprint selected but sprints exist, auto-select first one
            setSelectedSprint(sprints[0].id);
        }
    }, [selectedSprint, sprints]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const user = localStorage.getItem('user');
            const userId = user ? JSON.parse(user).id : null;

            if (!userId) {
                console.error('User ID not found in localStorage');
                return;
            }

            const response = await fetch(`https://work-management-chi.vercel.app/projects?userId=${userId}`);
            const data = await response.json();
            setProjects(Array.isArray(data) ? data : data.data || []);

            // Auto-select first project if available
            if (Array.isArray(data) && data.length > 0) {
                setSelectedProject(data[0].id);
            } else if (data.data && data.data.length > 0) {
                setSelectedProject(data.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSprints = async (projectId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`https://work-management-chi.vercel.app/sprints?projectId=${projectId}`);
            const data = await response.json();
            const sprintsData: Sprint[] = Array.isArray(data) ? data : data.data || [];
            setSprints(sprintsData);

            // Auto-select first sprint if available
            if (sprintsData.length > 0) {
                setSelectedSprint(sprintsData[0].id);
            }
        } catch (error) {
            console.error('Error fetching sprints:', error);
            setSprints([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async (sprintId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`https://work-management-chi.vercel.app/tasks?sprintId=${sprintId}`);
            const data = await response.json();
            const tasks: Task[] = Array.isArray(data) ? data : data.data || [];

            // Organize tasks by status
            const organizedColumns = columns.map(col => ({
                ...col,
                tasks: tasks.filter(task => task.status === col.id)
            }));

            setColumns(organizedColumns);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            // Keep existing columns structure but empty
            setColumns(columns.map(col => ({ ...col, tasks: [] })));
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done' | 'not_completed') => {
        try {
            const response = await fetch(`https://work-management-chi.vercel.app/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error updating task status:', response.status, errorData);
                throw new Error(`Failed to update task status: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Task status updated successfully:', result);
            return result;
        } catch (error) {
            console.error('Error updating task status:', error);
            throw error;
        }
    };

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

        // If drop in same column, do nothing
        if (draggedTask.columnId === targetColumnId) {
            setDraggedTask(null);
            return;
        }

        // Determine new status based on target column
        let newStatus: 'todo' | 'in_progress' | 'done' | 'not_completed' | null = null;
        if (targetColumnId === 'todo') newStatus = 'todo';
        if (targetColumnId === 'in_progress') newStatus = 'in_progress';
        if (targetColumnId === 'done') newStatus = 'done';
        if (targetColumnId === 'not_completed') newStatus = 'not_completed';

        // Find the dragged task
        let draggedTaskData: Task | null = null;

        const newColumns = columns
            .map(col => {
                if (col.id === draggedTask.columnId) {
                    const taskIndex = col.tasks.findIndex(t => t.id === draggedTask.taskId);
                    if (taskIndex !== -1) {
                        draggedTaskData = col.tasks[taskIndex];
                        return {
                            ...col,
                            tasks: col.tasks.filter((t) => t.id !== draggedTask.taskId)
                        };
                    }
                }
                return col;
            })
            .map(col => {
                if (col.id === targetColumnId && draggedTaskData && newStatus) {
                    // Update API
                    updateTaskStatus(draggedTaskData.id, newStatus);

                    return { ...col, tasks: [...col.tasks, { ...draggedTaskData, status: newStatus }] };
                }
                return col;
            });

        setColumns(newColumns);
        setDraggedTask(null);
    };

    const createTask = async () => {
        if (!selectedProject || !selectedSprint || !taskForm.title || !taskForm.description) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const user = localStorage.getItem('user');
            const reporterId = user ? JSON.parse(user).id : null;

            const response = await fetch('https://work-management-chi.vercel.app/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectId: selectedProject,
                    sprintId: selectedSprint,
                    title: taskForm.title,
                    description: taskForm.description,
                    type: 'task',
                    priority: taskForm.priority,
                    status: selectedColumnId || 'todo',
                    // reporterId: reporterId,
                    assigneeId: taskForm.assigneeId || null
                })
            });

            if (response.ok) {
                const newTask = await response.json();
                console.log('Task created:', newTask);

                // Reset form and close modal
                setTaskForm({ title: '', description: '', priority: 'medium', assigneeId: '' });
                setSelectedColumnId('');
                setShowAddTaskModal(false);

                // Refresh tasks
                fetchTasks(selectedSprint);
            } else {
                alert('Failed to create task');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Error creating task');
        }
    };

    const handleAddTask = (columnId: string) => {
        setSelectedColumnId(columnId);
        setShowAddTaskModal(true);
    };

    return (
        <Layout onLogout={onLogout}>
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-4">
                        {/* Project and Sprint Selector */}
                        <div className="flex items-center gap-3">
                            {/* Project Selector */}
                            <div className="flex items-center gap-2 relative group">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                    <span className="text-sm font-medium text-gray-700">
                                        {selectedProject && projects.find(p => p.id === selectedProject)?.name || 'Select Project'}
                                    </span>
                                    <ChevronDown size={16} className="text-gray-600" />
                                </button>
                                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-40 hidden group-hover:block max-h-60 overflow-y-auto">
                                    {projects.length === 0 ? (
                                        <div className="px-4 py-2 text-gray-500 text-sm">No projects available</div>
                                    ) : (
                                        projects.map(project => (
                                            <button
                                                key={project.id}
                                                onClick={() => setSelectedProject(project.id)}
                                                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedProject === project.id ? 'bg-purple-50 text-purple-600' : 'text-gray-700'}`}
                                            >
                                                {project.name}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Sprint Selector */}
                            {sprints.length > 0 && (
                                <div className="flex items-center gap-2 relative group">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                        <span className="text-sm font-medium text-gray-700">
                                            {selectedSprint && sprints.find(s => s.id === selectedSprint)?.name || 'Select Sprint'}
                                        </span>
                                        <ChevronDown size={16} className="text-gray-600" />
                                    </button>
                                    <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-40 hidden group-hover:block max-h-60 overflow-y-auto">
                                        {sprints.map(sprint => (
                                            <button
                                                key={sprint.id}
                                                onClick={() => setSelectedSprint(sprint.id)}
                                                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedSprint === sprint.id ? 'bg-purple-50 text-purple-600' : 'text-gray-700'}`}
                                            >
                                                {sprint.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 max-w-xs">
                                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search tasks"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-gray-500">Loading tasks...</div>
                    </div>
                )}
                {/* Kanban Board */}
                {!loading && (
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
                                            <span className="ml-2 text-gray-500">({column.tasks.length})</span>
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
                                                <h4 className="text-sm font-medium text-gray-800 mb-2">
                                                    {task.title}
                                                </h4>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    {task.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(task.priority)}`}>
                                                        {task.priority}
                                                    </span>
                                                    {task.priority === 'high' && (
                                                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                            !
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
                )}

                {/* Add Task Modal */}
                {showAddTaskModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Task</h2>

                            <div className="space-y-4">
                                {/* Task Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Task Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={taskForm.title}
                                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                        placeholder="e.g., Implement user authentication"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Task Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description *
                                    </label>
                                    <textarea
                                        value={taskForm.description}
                                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                        placeholder="Describe the task details..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        rows={3}
                                    />
                                </div>

                                {/* Priority */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Priority
                                    </label>
                                    <select
                                        value={taskForm.priority}
                                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as 'high' | 'medium' | 'low' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                {/* Assignee ID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assignee ID (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={taskForm.assigneeId}
                                        onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                                        placeholder="Enter assignee ID"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddTaskModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createTask}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                                >
                                    Create Task
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default BoardsPage;
