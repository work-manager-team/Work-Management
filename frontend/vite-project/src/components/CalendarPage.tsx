import React, { useState } from 'react';
import Layout from './Layout';

interface CalendarPageProps {
    onLogout: () => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onLogout }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

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

    return (
        <Layout onLogout={onLogout}>
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Calendar</h1>

                <div className="bg-white rounded-lg shadow-lg p-6">
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

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Day headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-center font-semibold text-gray-600 py-2">
                                {day}
                            </div>
                        ))}

                        {/* Empty cells for days before month starts */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-24 bg-gray-100 rounded-lg"></div>
                        ))}

                        {/* Days of month */}
                        {days.map((day) => (
                            <div
                                key={day}
                                className="h-24 bg-gray-50 border border-gray-200 rounded-lg p-2 hover:bg-gray-100 cursor-pointer transition"
                            >
                                <p className="text-sm font-semibold text-gray-700">{day}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CalendarPage;
