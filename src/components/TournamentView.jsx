// ===================================================
// TournamentView — Main view when tournament is active
// ===================================================
import { useState } from 'react';
import html2canvas from 'html2canvas';
import BracketView from './BracketView';
import FixtureTable from './FixtureTable';
import LiveMatch from './LiveMatch';

export default function TournamentView({ tournament, showToast }) {
  const [view, setView] = useState('bracket'); // 'bracket' | 'table'

  const { currentMatch, currentMatchId } = tournament;

  const handleOpenMatch = (matchId) => {
    tournament.openMatch(matchId);
  };

  const handleSubmitScore = (matchId, score1, score2) => {
    tournament.submitScore(matchId, score1, score2);
    showToast('Resultado registrado ✅', 'success');
  };

  const handleExport = async () => {
    try {
      const el = document.getElementById('bracket-export');
      if (!el) return;
      const canvas = await html2canvas(el, {
        backgroundColor: '#0d0d1a',
        scale: 2,
        logging: false,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tournament.tournamentName || 'canchero'}.png`;
      a.click();
      showToast('Bracket exportado 📸', 'success');
    } catch {
      showToast('Error al exportar', 'error');
    }
  };

  // Progress stats
  const allMatches = tournament.rounds.flatMap((r) => r.matches);
  const finished = allMatches.filter((m) => m.status === 'finished').length;
  const total = allMatches.filter((m) => m.team2 !== null).length;
  const progress = total > 0 ? Math.round((finished / total) * 100) : 0;

  return (
    <div className="tournament-view animate-in">
      {/* Header bar */}
      <div className="tournament-header">
        <div>
          <h1 className="tournament-title">{tournament.tournamentName}</h1>
          <div className="tournament-meta">
            <span className="badge badge-green">
              {tournament.teams.length} equipos
            </span>
            <span className="badge badge-blue">
              {tournament.rounds.length} ronda{tournament.rounds.length !== 1 ? 's' : ''}
            </span>
            <span className="badge badge-gray">
              {finished}/{total} partidos
            </span>
          </div>
        </div>
        <div className="tournament-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExport}
            id="btn-export"
            title="Exportar como imagen"
          >
            📸 Exportar
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (confirm('¿Reiniciar el torneo? Se perderán los resultados.')) {
                tournament.resetToSetup();
                showToast('Torneo reiniciado', 'success');
              }
            }}
            id="btn-reset"
          >
            🔄 Reiniciar
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-label">{progress}% completado</span>
      </div>

      {/* View toggle */}
      <div className="view-toggle">
        <button
          className={`view-btn ${view === 'bracket' ? 'active' : ''}`}
          onClick={() => setView('bracket')}
          id="btn-view-bracket"
        >
          🏟️ Bracket
        </button>
        <button
          className={`view-btn ${view === 'table' ? 'active' : ''}`}
          onClick={() => setView('table')}
          id="btn-view-table"
        >
          📋 Tabla
        </button>
      </div>

      {/* Content */}
      {view === 'bracket' ? (
        <BracketView tournament={tournament} onOpenMatch={handleOpenMatch} />
      ) : (
        <FixtureTable tournament={tournament} onOpenMatch={handleOpenMatch} />
      )}

      {/* Live match modal */}
      {currentMatchId && currentMatch && (
        <LiveMatch
          match={currentMatch}
          onSubmit={handleSubmitScore}
          onClose={tournament.closeMatch}
        />
      )}

      <style>{`
        .tournament-view {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .tournament-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-md);
          flex-wrap: wrap;
        }

        .tournament-title {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #fff 0%, var(--green-primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }

        .tournament-meta {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }

        .tournament-actions {
          display: flex;
          gap: var(--space-sm);
          flex-shrink: 0;
          align-items: flex-start;
        }

        .progress-bar-container {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .progress-bar-track {
          flex: 1;
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--green-primary), var(--green-secondary));
          border-radius: 3px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 8px rgba(0,245,160,0.4);
        }

        .progress-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .view-toggle {
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 4px;
          width: fit-content;
        }

        .view-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font);
          font-size: 13px;
          font-weight: 600;
          padding: 8px 18px;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition);
        }

        .view-btn:hover:not(.active) {
          color: var(--text-primary);
          background: rgba(255,255,255,0.06);
        }

        .view-btn.active {
          background: var(--green-primary);
          color: #0d0d1a;
          box-shadow: 0 0 12px rgba(0,245,160,0.3);
        }

        @media (max-width: 480px) {
          .tournament-title {
            font-size: 20px;
          }

          .tournament-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
