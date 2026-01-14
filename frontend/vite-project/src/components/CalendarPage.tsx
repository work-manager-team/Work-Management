import React, { useState, useEffect } from 'react';
import { Loader, ChevronDown, X, Plus } from 'lucide-react';
import Layout from './Layout';
import { apiCall, getAuthHeaders } from '../utils/api';

interface Project {
    id: string;
    name: string;
    [key: string]: any;
}

interface Sprint {
    id: string;
    projectId: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'planned' | 'active' | 'completed' | 'cancelled';
    [key: string]: any;
}

interface CalendarPageProps {
    onLogout: () => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onLogout }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [loading, setLoading] = useState(true);
    const [sprintsLoading, setSprintsLoading] = useState(false);
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedDaySprintss, setSelectedDaySprintss] = useState<Sprint[]>([]);
    const [updatingSprintId, setUpdatingSprintId] = useState<string | null>(null);
    const [showCreateSprintModal, setShowCreateSprintModal] = useState(false);
    const [sprintFormData, setSprintFormData] = useState({
        name: '',
        goal: '',
        startDate: '',
        endDate: '',
    });
    const [creatingSprint, setCreatingSprint] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [sprintToDelete, setSprintToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const userData = localStorage.getItem('user');
            if (!userData) {
                console.error('User not found');
                return;
            }

            const user = JSON.parse(userData);
            const userId = user.id;

            const response = await apiCall(
                `https://work-management-chi.vercel.app/projects?userId=${userId}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }

            const data = await response.json();
            setProjects(data);
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSprints = async (projectId: string) => {
        try {
            setSprintsLoading(true);
            const response = await apiCall(
                `https://work-management-chi.vercel.app/sprints?projectId=${projectId}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch sprints');
            }

            const data = await response.json();
            setSprints(data);
        } catch (err) {
            console.error('Error fetching sprints:', err);
            setSprints([]);
        } finally {
            setSprintsLoading(false);
        }
    };

    const handleProjectChange = (projectId: string) => {
        setSelectedProjectId(projectId);
        setShowProjectDropdown(false);
        fetchSprints(projectId);
    };

    const isDateInSprint = (day: number, sprint: Sprint): boolean => {
        const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        // Set to start of day for comparison
        dateToCheck.setHours(0, 0, 0, 0);

        const startDate = new Date(sprint.startDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(sprint.endDate);
        endDate.setHours(23, 59, 59, 999);

        return dateToCheck >= startDate && dateToCheck <= endDate;
    };

    const getSprintsForDay = (day: number): Sprint[] => {
        return sprints.filter(sprint => isDateInSprint(day, sprint));
    };

    const getWeekRows = (): number[][] => {
        const weeks: number[][] = [];
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);

        let week: number[] = Array(firstDay).fill(0);

        for (let day = 1; day <= daysInMonth; day++) {
            week.push(day);

            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        }

        // Fill remaining days
        if (week.length > 0) {
            while (week.length < 7) {
                week.push(0);
            }
            weeks.push(week);
        }

        return weeks;
    };

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const updateSprintStatus = async (sprintId: string, newStatus: 'planned' | 'active' | 'completed' | 'cancelled') => {
        try {
            setUpdatingSprintId(sprintId);

            // Map status to the correct endpoint
            let endpoint = '';
            switch (newStatus) {
                case 'active':
                    endpoint = `/sprints/${sprintId}/start`;
                    break;
                case 'completed':
                    endpoint = `/sprints/${sprintId}/complete`;
                    break;
                case 'cancelled':
                    endpoint = `/sprints/${sprintId}/cancel`;
                    break;
                case 'planned':
                    // For planned status, skip the update
                    setUpdatingSprintId(null);
                    return;
            }

            const response = await apiCall(
                `https://work-management-chi.vercel.app${endpoint}`,
                {
                    method: 'PATCH',
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update sprint status');
            }

            // Update local state
            const updatedSprints = sprints.map(sprint =>
                sprint.id === sprintId ? { ...sprint, status: newStatus } : sprint
            );
            setSprints(updatedSprints);

            // Update selected day sprints
            const updatedSelectedSprints = selectedDaySprintss.map(sprint =>
                sprint.id === sprintId ? { ...sprint, status: newStatus } : sprint
            );
            setSelectedDaySprintss(updatedSelectedSprints);

            console.log('Sprint status updated:', sprintId, newStatus);
        } catch (error) {
            console.error('Error updating sprint status:', error);
            alert('Failed to update sprint status');
        } finally {
            setUpdatingSprintId(null);
        }
    };

    const createSprint = async () => {
        if (!selectedProjectId || !sprintFormData.name || !sprintFormData.startDate || !sprintFormData.endDate) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setCreatingSprint(true);
            const response = await apiCall(
                'https://work-management-chi.vercel.app/sprints',
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        projectId: selectedProjectId,
                        name: sprintFormData.name,
                        goal: sprintFormData.goal,
                        startDate: sprintFormData.startDate,
                        endDate: sprintFormData.endDate,
                        status: 'planned'
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to create sprint');
            }

            const newSprint = await response.json();
            setSprints([...sprints, newSprint]);

            // Reset form
            setSprintFormData({
                name: '',
                goal: '',
                startDate: '',
                endDate: '',
            });
            setShowCreateSprintModal(false);
            console.log('Sprint created:', newSprint);
        } catch (error) {
            console.error('Error creating sprint:', error);
            alert('Failed to create sprint');
        } finally {
            setCreatingSprint(false);
        }
    };

    const deleteSprint = async (sprintId: string) => {
        setSprintToDelete(sprintId);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteSprint = async () => {
        if (!sprintToDelete) return;

        try {
            setUpdatingSprintId(sprintToDelete);
            const response = await apiCall(
                `https://work-management-chi.vercel.app/sprints/${sprintToDelete}`,
                {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete sprint');
            }

            // Remove from sprints list
            const updatedSprints = sprints.filter(sprint => sprint.id !== sprintToDelete);
            setSprints(updatedSprints);

            // Remove from selected day sprints
            const updatedSelectedSprints = selectedDaySprintss.filter(sprint => sprint.id !== sprintToDelete);
            setSelectedDaySprintss(updatedSelectedSprints);

            // Close modal if no more sprints for the day
            if (updatedSelectedSprints.length === 0) {
                setSelectedDay(null);
                setSelectedDaySprintss([]);
            }

            console.log('Sprint deleted:', sprintToDelete);
            setShowDeleteConfirm(false);
            setSprintToDelete(null);
        } catch (error) {
            console.error('Error deleting sprint:', error);
            alert('Failed to delete sprint');
        } finally {
            setUpdatingSprintId(null);
        }
    };

    return (
        <Layout onLogout={onLogout}>
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Calendar</h1>

                {loading ? (
                    <div className="bg-white rounded-lg shadow-lg p-12 flex flex-col items-center justify-center">
                        <Loader size={48} className="text-purple-500 animate-spin mb-4" />
                        <p className="text-gray-600 text-lg">Loading projects...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        {/* Project Selector */}
                        <div className="mb-6 flex items-end gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between bg-white hover:bg-gray-50 transition"
                                    >
                                        <span className="text-gray-800">
                                            {selectedProjectId
                                                ? projects.find(p => p.id === selectedProjectId)?.name || 'Select a project'
                                                : 'Select a project'}
                                        </span>
                                        <ChevronDown size={20} className="text-gray-600" />
                                    </button>

                                    {showProjectDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                            {projects.map(project => (
                                                <button
                                                    key={project.id}
                                                    onClick={() => handleProjectChange(project.id)}
                                                    className={`w-full text-left px-4 py-2 hover:bg-purple-50 transition ${selectedProjectId === project.id ? 'bg-purple-100' : ''
                                                        }`}
                                                >
                                                    {project.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateSprintModal(true)}
                                disabled={!selectedProjectId}
                                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium flex items-center gap-2 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <Plus size={20} />
                                New Sprint
                            </button>
                        </div>

                        {sprintsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader size={32} className="text-purple-500 animate-spin mr-2" />
                                <span className="text-gray-600">Loading sprints...</span>
                            </div>
                        ) : (
                            <>
                                {/* Calendar Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <button
                                        onClick={handlePrevMonth}
                                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium"
                                    >
                                        ← Previous
                                    </button>
                                    <h2 className="text-2xl font-semibold text-gray-800">{monthName}</h2>
                                    <button
                                        onClick={handleNextMonth}
                                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium"
                                    >
                                        Next →
                                    </button>
                                </div>

                                {/* Calendar Grid - Week view like Jira */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    {/* Week rows */}
                                    {getWeekRows().map((week, weekIndex) => (
                                        <div key={weekIndex}>
                                            {/* Day headers for first week */}
                                            {weekIndex === 0 && (
                                                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                                        <div key={day} className="text-center font-semibold text-gray-700 py-3 border-r border-gray-200 last:border-r-0">
                                                            {day}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {/* Days */}
                                            <div className="grid grid-cols-7">
                                                {week.map((day, dayIndex) => {
                                                    const daySprints = day > 0 ? getSprintsForDay(day) : [];
                                                    return (
                                                        <div
                                                            key={dayIndex}
                                                            className={`min-h-32 border-r border-b border-gray-200 last:border-r-0 p-2 ${day === 0 ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                                                                } transition cursor-pointer`}
                                                            onClick={() => {
                                                                if (day > 0 && daySprints.length > 0) {
                                                                    setSelectedDay(day);
                                                                    setSelectedDaySprintss(daySprints);
                                                                }
                                                            }}
                                                        >
                                                            {day > 0 && (
                                                                <>
                                                                    <p className="text-sm font-semibold text-gray-700 mb-2">{day}</p>
                                                                    <div className="space-y-1 max-h-28 overflow-y-auto">
                                                                        {daySprints.map((sprint) => (
                                                                            <div
                                                                                key={sprint.id}
                                                                                className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-sm font-medium line-clamp-1"
                                                                                title={sprint.name}
                                                                            >
                                                                                {sprint.name}
                                                                            </div>

                                                                        ))}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Sprint Details Modal */}
            {selectedDay && selectedDaySprintss.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Sprints on {currentMonth.toLocaleString('default', { month: 'short' })} {selectedDay}
                            </h2>
                            <button
                                onClick={() => {
                                    setSelectedDay(null);
                                    setSelectedDaySprintss([]);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {selectedDaySprintss.map((sprint) => (
                                <div
                                    key={sprint.id}
                                    className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="text-sm font-semibold text-cyan-900 break-words flex-1">{sprint.name}</p>
                                        <button
                                            onClick={() => deleteSprint(sprint.id)}
                                            disabled={updatingSprintId === sprint.id}
                                            className="ml-2 text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Delete sprint"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="mt-2 text-xs text-cyan-700">
                                        <p>
                                            <strong>Start:</strong> {new Date(sprint.startDate).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <strong>End:</strong> {new Date(sprint.endDate).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <strong>Status:</strong>
                                        </p>
                                        <select
                                            value={sprint.status}
                                            onChange={(e) => updateSprintStatus(sprint.id, e.target.value as 'planned' | 'active' | 'completed' | 'cancelled')}
                                            disabled={updatingSprintId === sprint.id}
                                            className="w-full mt-1 px-2 py-1 border border-cyan-300 rounded bg-white text-cyan-900 text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="planned">Planned</option>
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Sprint Modal */}
            {showCreateSprintModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Create New Sprint</h2>
                            <button
                                onClick={() => {
                                    setShowCreateSprintModal(false);
                                    setSprintFormData({
                                        name: '',
                                        goal: '',
                                        startDate: '',
                                        endDate: '',
                                    });
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sprint Name *</label>
                                <input
                                    type="text"
                                    value={sprintFormData.name}
                                    onChange={(e) => setSprintFormData({ ...sprintFormData, name: e.target.value })}
                                    placeholder="Sprint name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sprint Goal</label>
                                <textarea
                                    value={sprintFormData.goal}
                                    onChange={(e) => setSprintFormData({ ...sprintFormData, goal: e.target.value })}
                                    placeholder="Sprint goal"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                <input
                                    type="date"
                                    value={sprintFormData.startDate}
                                    onChange={(e) => setSprintFormData({ ...sprintFormData, startDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                                <input
                                    type="date"
                                    value={sprintFormData.endDate}
                                    onChange={(e) => setSprintFormData({ ...sprintFormData, endDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowCreateSprintModal(false);
                                        setSprintFormData({
                                            name: '',
                                            goal: '',
                                            startDate: '',
                                            endDate: '',
                                        });
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createSprint}
                                    disabled={creatingSprint}
                                    className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {creatingSprint ? (
                                        <>
                                            <Loader size={18} className="animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Sprint'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Sprint Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Sprint?</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this sprint? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setSprintToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteSprint}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default CalendarPage;