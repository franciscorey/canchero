// ===================================================
// App.jsx — Main application shell
// ===================================================
import { useState } from 'react';
import { useTournament } from './hooks/useTournament';
import { useToast } from './hooks/useToast';
import SetupView from './components/SetupView';
import TournamentView from './components/TournamentView';
import Toast from './components/Toast';
import './App.css';

export default function App() {
  const tournament = useTournament();
  const { toasts, showToast } = useToast();

  // Determine active tab
  const isActive = tournament.status === 'active' || tournament.status === 'finished';
  const [tab, setTab] = useState(isActive ? 'tournament' : 'setup');

  const handleGenerate = () => {
    setTab('tournament');
  };

  const handleReset = () => {
    setTab('setup');
  };

  // Override closeMatch to also update tab if needed
  const tournamentWithReset = {
    ...tournament,
    resetToSetup: () => {
      tournament.resetToSetup();
      handleReset();
    },
    resetTournament: () => {
      tournament.resetTournament();
      handleReset();
    },
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => setTab(isActive ? 'tournament' : 'setup')}>
            <span className="logo-icon">⚽</span>
            <span className="logo-text">Canchero</span>
          </div>

          <nav className="nav-tabs" role="navigation" aria-label="Navegación principal">
            <button
              className={`nav-tab ${tab === 'setup' ? 'active' : ''}`}
              onClick={() => setTab('setup')}
              id="nav-setup"
            >
              <span className="tab-icon">👥</span>
              <span className="tab-label">Equipos</span>
            </button>

            {isActive && (
              <button
                className={`nav-tab ${tab === 'tournament' ? 'active' : ''}`}
                onClick={() => setTab('tournament')}
                id="nav-tournament"
              >
                <span className="tab-icon">🏆</span>
                <span className="tab-label">Torneo</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content">
        {tab === 'setup' ? (
          <SetupView
            tournament={tournament}
            onGenerate={handleGenerate}
            showToast={showToast}
          />
        ) : (
          <TournamentView
            tournament={tournamentWithReset}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          Hecho con ⚽ para el fútbol amateur chileno ·{' '}
          <span className="text-green">Canchero</span>
        </p>
      </footer>

      {/* Toasts */}
      <Toast toasts={toasts} />
    </div>
  );
}
