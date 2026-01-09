import React, { useState, useEffect } from 'react';
import { Loader, ChevronDown, X } from 'lucide-react';
import Layout from '../../components/layout/Layout';

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

/*interface CalendarPageProps {
    onLogout: () => void;
}*/

const CalendarPage = () => {
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

            const response = await fetch(
                `https://work-management-chi.vercel.app/projects?userId=${userId}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }

            const data = await response.json();
            setProjects(data);

            // Auto-select first project
            if (data.length > 0) {
                setSelectedProjectId(String(data[0].id));
                fetchSprints(String(data[0].id));
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSprints = async (projectId: string) => {
        try {
            setSprintsLoading(true);
            const response = await fetch(
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
            const response = await fetch(`https://work-management-chi.vercel.app/sprints/${sprintId}/${newStatus}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

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

    return (
        <div>
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
                        <div className="mb-6 relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
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
                                    <p className="text-sm font-semibold text-cyan-900 break-words">{sprint.name}</p>
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
        </div>
        
    );
};

export default CalendarPage;