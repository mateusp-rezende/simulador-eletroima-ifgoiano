import { useState, useEffect } from 'react';
import { IndustrialTwin } from './components/IndustrialTwin';
import { PhysicsTutorial } from './components/PhysicsTutorial';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'twin' | 'tutorial'>('twin');
  const [perfMode, setPerfMode] = useState(false);

  // Sync performance mode class to body element
  useEffect(() => {
    document.body.classList.toggle('perf-mode', perfMode);
  }, [perfMode]);

  return (
    <div className="app-container">
      {/* ══ NAV BAR ══ */}
      <header className="navbar">
        <div className="nav-logo-area">
          <div className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <div className="nav-title-block">
            <h1 className="nav-title">
              Eletromagnetismo · <span style={{ color: 'var(--cyan)' }}>IF Goiano</span>
            </h1>
            <p className="nav-subtitle">Gêmeo Digital + Laboratório e Apresentação</p>
          </div>
        </div>

        <div className="nav-controls">
          {/* Navigation View switcher Tabs */}
          <div className="nav-tabs">
            <button 
              className={`nav-tab-btn ${currentView === 'twin' ? 'active' : ''}`}
              onClick={() => setCurrentView('twin')}
            >
              Gêmeo Digital Industrial
            </button>
            <button 
              className={`nav-tab-btn ${currentView === 'tutorial' ? 'active' : ''}`}
              onClick={() => setCurrentView('tutorial')}
            >
              Tutorial &amp; Laboratório
            </button>
          </div>

          {/* Performance Mode Switch */}
          <label className="perf-toggle-label">
            <input 
              type="checkbox" 
              checked={perfMode} 
              onChange={(e) => setPerfMode(e.target.checked)} 
            />
            Modo Desempenho (Sombra/Brilho Off)
          </label>
        </div>
      </header>

      {/* ══ ACTIVE VIEW RENDERER ══ */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {currentView === 'twin' ? <IndustrialTwin /> : <PhysicsTutorial />}
      </main>
    </div>
  );
}

export default App;
