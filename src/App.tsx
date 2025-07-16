import './App.css';
import { DebugControlPanel } from './components/Debug/DebugControlPanel';
import { Desktop } from './components/Desktop/Desktop';
import { Taskbar } from './components/Taskbar/Taskbar';
import { DesktopContext } from './contexts/DesktopContext';
import {
    useDesktopBackground,
    type IDesktopBackgroundHook,
} from './hooks/useDesktopBackground';

function App() {
    const desktopBackground: IDesktopBackgroundHook = useDesktopBackground();

    return (
        <DesktopContext.Provider value={desktopBackground}>
            <div className="app">
                <Desktop />
                <Taskbar />
                <DebugControlPanel />
            </div>
        </DesktopContext.Provider>
    );
}

export default App;
