import './Taskbar.css';

export function Taskbar() {
  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="taskbar">
      <div className="start-button">
        <span className="start-icon">⊞</span>
        Start
      </div>

      <div className="taskbar-center">{/* Task buttons will go here */}</div>

      <div className="system-tray">
        <div className="clock">{currentTime}</div>
      </div>
    </div>
  );
}
