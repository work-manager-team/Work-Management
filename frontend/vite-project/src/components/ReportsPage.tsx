import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';
import Layout from './Layout';

interface ReportsPageProps {
    onLogout: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onLogout }) => {
    const [reportType, setReportType] = useState('summary');

    const reports = [
        {
            id: 1,
            title: 'Project Overview',
            tasks: 45,
            completed: 32,
            progress: 71,
            team: 8
        },
        {
            id: 2,
            title: 'Team Performance',
            tasks: 28,
            completed: 24,
            progress: 86,
            team: 5
        },
        {
            id: 3,
            title: 'Design Sprint',
            tasks: 15,
            completed: 10,
            progress: 67,
            team: 3
        }
    ];

    return (
        <Layout onLogout={onLogout}>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Reports</h1>

                {/* Report Type Selector */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setReportType('summary')}
                            className={`px-6 py-2 rounded font-medium transition ${reportType === 'summary'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                        >
                            Summary
                        </button>
                        <button
                            onClick={() => setReportType('detailed')}
                            className={`px-6 py-2 rounded font-medium transition ${reportType === 'detailed'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                        >
                            Detailed
                        </button>
                        <button
                            onClick={() => setReportType('analytics')}
                            className={`px-6 py-2 rounded font-medium transition ${reportType === 'analytics'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                        >
                            Analytics
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Tasks</p>
                                <p className="text-3xl font-bold text-gray-800">127</p>
                            </div>
                            <BarChart3 size={32} className="text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-3xl font-bold text-green-600">85</p>
                            </div>
                            <TrendingUp size={32} className="text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">In Progress</p>
                                <p className="text-3xl font-bold text-blue-600">32</p>
                            </div>
                            <Clock size={32} className="text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Team Members</p>
                                <p className="text-3xl font-bold text-orange-600">12</p>
                            </div>
                            <Users size={32} className="text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Reports List */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Project Reports</h2>

                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                                    <span className="text-sm text-gray-600">{report.progress}% Complete</span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Tasks</p>
                                        <p className="text-xl font-bold text-gray-800">{report.tasks}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Completed</p>
                                        <p className="text-xl font-bold text-green-600">{report.completed}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Team Size</p>
                                        <p className="text-xl font-bold text-blue-600">{report.team}</p>
                                    </div>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-500 h-2 rounded-full transition-all"
                                        style={{ width: `${report.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ReportsPage;
