// ===================================================
// LiveMatch — Real-time scoreboard modal
// ===================================================
import { useState, useEffect } from 'react';

export default function LiveMatch({ match, onSubmit, onClose }) {
  const [score1, setScore1] = useState(match.score1 || 0);
  const [score2, setScore2] = useState(match.score2 || 0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Stopwatch
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleGoal = (team) => {
    if (team === 1) setScore1((s) => s + 1);
    else setScore2((s) => s + 1);
  };

  const handleUndo = (team) => {
    if (team === 1) setScore1((s) => Math.max(0, s - 1));
    else setScore2((s) => Math.max(0, s - 1));
  };

  const handleFinish = () => {
    if (score1 === score2) {
      setConfirming(true);
      return;
    }
    onSubmit(match.id, score1, score2);
  };

  const handleForceFinish = () => {
    onSubmit(match.id, score1, score2);
  };

  const team1 = match.team1?.name || 'Equipo 1';
  const team2 = match.team2?.name || 'Equipo 2';
  const isLeading1 = score1 > score2;
  const isLeading2 = score2 > score1;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal live-modal" role="dialog" aria-label="Marcador en vivo">
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="live-indicator">
              <span className="live-dot" />
              EN VIVO
            </div>
            <h2 className="modal-title" style={{ fontSize: 16, marginTop: 4 }}>
              {team1} vs {team2}
            </h2>
          </div>
          <button className="modal-close" onClick={onClose} id="btn-close-match">✕</button>
        </div>

        {/* Scoreboard */}
        <div className="scoreboard">
          <ScorePanel
            name={team1}
            score={score1}
            isLeading={isLeading1}
            onGoal={() => handleGoal(1)}
            onUndo={() => handleUndo(1)}
            side="left"
          />

          <div className="scoreboard-center">
            <div className="timer-display">
              <div className="timer-value">{formatTime(time)}</div>
              <button
                className={`btn btn-sm ${running ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => setRunning((r) => !r)}
                id="btn-timer-toggle"
              >
                {running ? '⏸ Pausar' : '▶ Iniciar'}
              </button>
            </div>
            <div className="vs-separator">VS</div>
          </div>

          <ScorePanel
            name={team2}
            score={score2}
            isLeading={isLeading2}
            onGoal={() => handleGoal(2)}
            onUndo={() => handleUndo(2)}
            side="right"
          />
        </div>

        {/* Events log (visual only) */}
        <div className="divider" />

        {/* Confirm draw dialog */}
        {confirming ? (
          <div className="draw-confirm">
            <p style={{ fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
              ⚠️ El partido termina empatado {score1}–{score2}
            </p>
            <p className="text-muted" style={{ fontSize: 13, marginBottom: 'var(--space-md)' }}>
              En eliminación directa debe haber un ganador. Puedes seguir jugando o forzar un ganador por penales.
            </p>
            <div className="flex gap-sm">
              <button className="btn btn-secondary" onClick={() => setConfirming(false)}>
                Seguir jugando
              </button>
              <button className="btn btn-primary" onClick={handleForceFinish} id="btn-force-finish">
                🎲 Definir al azar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-sm" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleFinish}
              id="btn-finish-match"
            >
              ✅ Finalizar Partido
            </button>
          </div>
        )}
      </div>

      <style>{`
        .live-modal {
          max-width: 560px;
          width: 100%;
        }

        .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          color: var(--red);
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: var(--red);
          border-radius: 50%;
          animation: pulse-green 1.2s infinite;
        }

        .scoreboard {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: var(--space-md);
          align-items: center;
          padding: var(--space-lg) 0;
        }

        .scoreboard-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
        }

        .timer-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
        }

        .timer-value {
          font-size: 22px;
          font-weight: 900;
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
          letter-spacing: -1px;
        }

        .vs-separator {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 2px;
        }

        .draw-confirm {
          padding: var(--space-lg);
          background: rgba(255,190,11,0.06);
          border: 1px solid rgba(255,190,11,0.2);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-md);
          color: var(--amber);
        }

        @media (max-width: 480px) {
          .scoreboard {
            gap: var(--space-sm);
          }
        }
      `}</style>
    </div>
  );
}

function ScorePanel({ name, score, isLeading, onGoal, onUndo, side }) {
  return (
    <div className={`score-panel ${isLeading ? 'leading' : ''} ${side}`}>
      <div className="score-team-name">{name}</div>
      <div className={`score-big ${isLeading ? 'text-green' : ''}`}>{score}</div>
      <div className="score-controls">
        <button
          className="goal-btn"
          onClick={onGoal}
          id={`btn-goal-${side}`}
          aria-label={`Gol ${name}`}
        >
          ⚽ Gol
        </button>
        <button
          className="undo-btn"
          onClick={onUndo}
          disabled={score === 0}
          id={`btn-undo-${side}`}
          aria-label={`Deshacer gol ${name}`}
        >
          ↩
        </button>
      </div>

      <style>{`
        .score-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          background: rgba(255,255,255,0.02);
          transition: all var(--transition);
        }

        .score-panel.leading {
          background: rgba(0,245,160,0.06);
          border-color: var(--border-accent);
          box-shadow: var(--shadow-green);
        }

        .score-team-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
          text-align: center;
          word-break: break-word;
        }

        .score-controls {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .goal-btn {
          background: var(--green-primary);
          color: #0d0d1a;
          border: none;
          border-radius: var(--radius-md);
          font-family: var(--font);
          font-size: 14px;
          font-weight: 700;
          padding: 12px 8px;
          cursor: pointer;
          width: 100%;
          transition: all var(--transition);
          box-shadow: 0 0 16px rgba(0,245,160,0.3);
        }

        .goal-btn:hover {
          background: var(--green-secondary);
          transform: scale(1.03);
          box-shadow: var(--shadow-green-intense);
        }

        .goal-btn:active {
          transform: scale(0.97);
        }

        .undo-btn {
          background: none;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          font-family: var(--font);
          font-size: 16px;
          padding: 6px;
          cursor: pointer;
          width: 100%;
          transition: all var(--transition);
        }

        .undo-btn:hover:not(:disabled) {
          border-color: rgba(255,77,109,0.3);
          color: var(--red);
        }

        .undo-btn:disabled {
          opacity: 0.2;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
