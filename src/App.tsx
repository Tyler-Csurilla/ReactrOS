import { Desktop } from './components/Desktop/Desktop';
import { Taskbar } from './components/Taskbar/Taskbar';
import './App.css';

function App() {
  return (
    <div className="app">
      <Desktop />
      <Taskbar />
    </div>
  );
}

export default App;
