import { useEffect, useState } from 'react';
import './Taskbar.css';

export function Taskbar() {
    const [currentTime, setCurrentTime] = useState(
        new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(
                new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })
            );
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="taskbar">
            <div className="start-button">
                <span className="start-icon">☆</span>
                Start
            </div>

            <div className="taskbar-center">
                {/* Task buttons will go here */}
            </div>

            <div className="system-tray">
                <div className="clock">{currentTime}</div>
            </div>
        </div>
    );
}
