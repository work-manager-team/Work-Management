import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';
import Layout from './Layout';
import { apiCall, getAuthHeaders } from '../utils/api';

interface ProjectDetail {
    id: string | number;
    name: string;
    key: string;
    description: string;
    ownerId: number;
    status: string;
    visibility: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
    memberCount: number;
    totalSprints: number;
    completedSprints: number;
}

interface ReportsPageProps {
    onLogout: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onLogout }) => {
    const [projects, setProjects] = useState<ProjectDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalStats, setTotalStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        totalMembers: 0,
        totalSprints: 0,
        completedSprints: 0
    });

    // Fetch projects on component mount
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const user = localStorage.getItem('user');
            const userId = user ? JSON.parse(user).id : null;

            if (!userId) {
                console.error('User ID not found in localStorage');
                return;
            }

            // First, get all projects
            const projectsResponse = await apiCall(`https://work-management-chi.vercel.app/projects?userId=${userId}`);
            const projectsData = await projectsResponse.json();
            const projectsList = Array.isArray(projectsData) ? projectsData : projectsData.data || [];

            // Then fetch details for each project
            const projectDetailsPromises = projectsList.map((project: any) =>
                apiCall(`https://work-management-chi.vercel.app/projects/${project.id}/details`)
                    .then(res => res.json())
                    .catch(err => {
                        console.error('Error fetching project details:', err);
                        return null;
                    })
            );

            const projectDetails = await Promise.all(projectDetailsPromises);
            const validProjects = projectDetails.filter(p => p !== null) as ProjectDetail[];

            setProjects(validProjects);

            // Calculate totals
            const stats = {
                totalProjects: validProjects.length,
                activeProjects: validProjects.filter(p => p.status === 'active').length,
                totalMembers: validProjects.reduce((sum, p) => sum + (p.memberCount || 0), 0),
                totalSprints: validProjects.reduce((sum, p) => sum + (p.totalSprints || 0), 0),
                completedSprints: validProjects.reduce((sum, p) => sum + (p.completedSprints || 0), 0)
            };
            setTotalStats(stats);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout onLogout={onLogout}>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Reports</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Projects</p>
                                <p className="text-3xl font-bold text-gray-800">{totalStats.totalProjects}</p>
                            </div>
                            <BarChart3 size={32} className="text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Projects</p>
                                <p className="text-3xl font-bold text-green-600">{totalStats.activeProjects}</p>
                            </div>
                            <TrendingUp size={32} className="text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Sprints</p>
                                <p className="text-3xl font-bold text-blue-600">{totalStats.totalSprints}</p>
                            </div>
                            <Clock size={32} className="text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Team Members</p>
                                <p className="text-3xl font-bold text-orange-600">{totalStats.totalMembers}</p>
                            </div>
                            <Users size={32} className="text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Reports List */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Project Details</h2>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No projects found</div>
                    ) : (
                        <div className="space-y-4">
                            {projects.map((project) => {
                                const sprintProgress = project.totalSprints > 0
                                    ? Math.round((project.completedSprints / project.totalSprints) * 100)
                                    : 0;

                                return (
                                    <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                                                <p className="text-sm text-gray-600">{project.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${project.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {project.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-4 mb-3">
                                            <div>
                                                <p className="text-sm text-gray-600">Total Sprints</p>
                                                <p className="text-xl font-bold text-gray-800">{project.totalSprints}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Completed Sprints</p>
                                                <p className="text-xl font-bold text-green-600">{project.completedSprints}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Team Members</p>
                                                <p className="text-xl font-bold text-blue-600">{project.memberCount}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Key</p>
                                                <p className="text-xl font-bold text-purple-600">{project.key}</p>
                                            </div>
                                        </div>

                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-purple-500 h-2 rounded-full transition-all"
                                                style={{ width: `${sprintProgress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{sprintProgress}% sprints completed</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ReportsPage;
