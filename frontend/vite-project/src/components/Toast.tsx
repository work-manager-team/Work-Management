import React, { useEffect } from 'react';
import { X, Bell, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface ToastProps {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    onClose: (id: string) => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ id, title, message, type, onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'error':
                return 'bg-red-500';
            default:
                return 'bg-blue-500';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} />;
            case 'warning':
                return <AlertTriangle size={20} />;
            case 'error':
                return <AlertCircle size={20} />;
            default:
                return <Bell size={20} />;
        }
    };

    return (
        <div
            className={`${getBgColor()} text-white rounded-lg shadow-lg p-4 mb-3 flex items-start gap-3 animate-slideIn min-w-80`}
        >
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
            <div className="flex-1">
                <h4 className="font-semibold">{title}</h4>
                <p className="text-sm mt-1 opacity-90">{message}</p>
            </div>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 hover:opacity-80 transition"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export default Toast;
