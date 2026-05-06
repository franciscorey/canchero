// ===================================================
// SetupView — Team management & tournament config
// ===================================================
import { useState, useRef } from 'react';

const TEAM_PRESETS = [
  '🔵 Los Guachines', '🔴 La Máquina', '🟡 Los Cracks', '⚫ El Barrio',
  '🟢 Los Tigres', '🟠 Los Pibes', '🟣 La Banda', '🔶 Los Fieras',
];

export default function SetupView({ tournament, onGenerate, showToast }) {
  const [teamInput, setTeamInput] = useState('');
  const inputRef = useRef();

  const handleAddTeam = () => {
    const name = teamInput.trim();
    if (!name) return;
    if (tournament.teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      showToast('Ya existe un equipo con ese nombre', 'error');
      return;
    }
    tournament.addTeam(name);
    setTeamInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTeam();
  };

  const handleAddPreset = (preset) => {
    if (tournament.teams.some((t) => t.name === preset)) {
      showToast('Ese equipo ya fue agregado', 'error');
      return;
    }
    tournament.addTeam(preset);
    showToast(`${preset} agregado`, 'success');
  };

  const handleGenerate = () => {
    if (tournament.teams.length < 2) {
      showToast('Necesitas al menos 2 equipos', 'error');
      return;
    }
    tournament.generateBracket();
    onGenerate();
    showToast('¡Fixture generado! A jugar ⚽', 'success');
  };

  const teamCount = tournament.teams.length;
  const canGenerate = teamCount >= 2;

  return (
    <div className="setup-view animate-in">
      {/* Tournament name */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header" style={{ marginBottom: 'var(--space-md)' }}>
          <span className="card-title">🏆 Nombre del Campeonato</span>
        </div>
        <input
          className="input"
          type="text"
          value={tournament.tournamentName}
          onChange={(e) => tournament.setTournamentName(e.target.value)}
          placeholder="Ej: Copa del Barrio 2025"
          maxLength={50}
        />
      </div>

      {/* Add teams */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <span className="card-title">
            👥 Equipos
            <span
              className={`badge ${teamCount >= 2 ? 'badge-green' : 'badge-gray'}`}
              style={{ marginLeft: 'var(--space-sm)' }}
            >
              {teamCount}
            </span>
          </span>
          <span className="text-muted" style={{ fontSize: 12 }}>
            {teamCount < 2 ? 'Mínimo 2' : canGenerate ? `✓ Listos` : ''}
          </span>
        </div>

        {/* Input */}
        <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
          <input
            ref={inputRef}
            className="input"
            type="text"
            value={teamInput}
            onChange={(e) => setTeamInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nombre del equipo..."
            maxLength={30}
          />
          <button
            id="btn-add-team"
            className="btn btn-primary"
            onClick={handleAddTeam}
            disabled={!teamInput.trim()}
          >
            + Agregar
          </button>
        </div>

        {/* Team list */}
        {tournament.teams.length > 0 ? (
          <div className="team-list">
            {tournament.teams.map((team, i) => (
              <div key={team.id} className="team-item animate-in" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="team-item-left">
                  <span className="team-seed">{i + 1}</span>
                  <span className="team-name">{team.name}</span>
                </div>
                <button
                  className="btn btn-danger btn-sm btn-icon"
                  onClick={() => tournament.removeTeam(team.id)}
                  title="Eliminar equipo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
            <div className="empty-state-icon">👥</div>
            <p className="empty-state-text">Agrega equipos para comenzar</p>
          </div>
        )}

        {/* Presets */}
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <p className="label">Sugerencias rápidas</p>
          <div className="preset-grid">
            {TEAM_PRESETS.map((p) => (
              <button
                key={p}
                className={`preset-chip ${tournament.teams.some((t) => t.name === p) ? 'used' : ''}`}
                onClick={() => handleAddPreset(p)}
                disabled={tournament.teams.some((t) => t.name === p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate */}
      <div className="generate-section">
        <div className="generate-info">
          {teamCount > 0 && (
            <p className="text-muted" style={{ fontSize: 13 }}>
              Con {teamCount} equipo{teamCount !== 1 ? 's' : ''} se generará un bracket de{' '}
              <strong className="text-green">{Math.pow(2, Math.ceil(Math.log2(Math.max(teamCount, 2))))} posiciones</strong>
            </p>
          )}
        </div>
        <button
          id="btn-generate-bracket"
          className="btn btn-primary btn-lg"
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          ⚡ Generar Fixture
        </button>
      </div>

      <style>{`
        .setup-view {
          max-width: 600px;
          margin: 0 auto;
        }

        .team-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .team-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          transition: all var(--transition);
        }

        .team-item:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
        }

        .team-item-left {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .team-seed {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          min-width: 18px;
          text-align: center;
        }

        .team-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .preset-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
          margin-top: var(--space-sm);
        }

        .preset-chip {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          font-family: var(--font);
          font-size: 12px;
          font-weight: 500;
          padding: 5px 12px;
          cursor: pointer;
          transition: all var(--transition);
        }

        .preset-chip:hover:not(:disabled) {
          background: var(--green-subtle);
          border-color: var(--border-accent);
          color: var(--green-primary);
        }

        .preset-chip.used, .preset-chip:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .generate-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-xl);
          background: var(--green-subtle);
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-xl);
        }
      `}</style>
    </div>
  );
}
