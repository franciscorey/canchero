// ===================================================
// FixtureTable — Tabular view of all matches
// ===================================================

export default function FixtureTable({ tournament, onOpenMatch }) {
  const { rounds } = tournament;

  if (!rounds.length) return null;

  const allMatches = rounds.flatMap((r, roundIdx) =>
    r.matches.map((m) => ({ ...m, roundName: r.name, roundIdx }))
  );

  const pending = allMatches.filter((m) => m.status === 'pending');
  const finished = allMatches.filter((m) => m.status === 'finished');

  return (
    <div className="fixture-table animate-in">
      {pending.length > 0 && (
        <div className="table-section">
          <h3 className="table-section-title">
            <span className="badge badge-amber">Pendientes</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
              {pending.length} partido{pending.length !== 1 ? 's' : ''}
            </span>
          </h3>
          <div className="matches-table">
            {pending.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                onOpen={() => onOpenMatch(match.id)}
              />
            ))}
          </div>
        </div>
      )}

      {finished.length > 0 && (
        <div className="table-section">
          <h3 className="table-section-title">
            <span className="badge badge-green">Finalizados</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
              {finished.length} partido{finished.length !== 1 ? 's' : ''}
            </span>
          </h3>
          <div className="matches-table">
            {finished.map((match) => (
              <MatchRow key={match.id} match={match} finished />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .fixture-table {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .table-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .table-section-title {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 14px;
          font-weight: 700;
        }

        .matches-table {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
      `}</style>
    </div>
  );
}

function MatchRow({ match, onOpen, finished }) {
  const t1 = match.team1?.name || '—';
  const t2 = match.team2?.name || 'Bye';
  const isBye = !match.team2;
  const w = match.winner;

  return (
    <div
      className={`match-row ${!finished && !isBye ? 'clickable' : ''} ${finished ? 'finished' : ''}`}
      onClick={!finished && !isBye ? onOpen : undefined}
      id={`fixture-row-${match.id}`}
    >
      <div className="match-row-round">{match.roundName}</div>

      <div className="match-row-teams">
        <span
          className={`mr-team ${finished && w?.id === match.team1?.id ? 'mr-winner' : ''} ${finished && w?.id === match.team2?.id ? 'mr-loser' : ''}`}
        >
          {finished && w?.id === match.team1?.id && <span>👑</span>}
          {t1}
        </span>

        <div className="mr-score">
          {finished ? (
            <span className="mr-score-val">{match.score1} – {match.score2}</span>
          ) : (
            <span className="mr-score-val" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              {isBye ? 'BYE' : 'vs'}
            </span>
          )}
        </div>

        <span
          className={`mr-team mr-team-right ${finished && w?.id === match.team2?.id ? 'mr-winner' : ''} ${finished && w?.id === match.team1?.id ? 'mr-loser' : ''}`}
        >
          {t2}
          {finished && w?.id === match.team2?.id && <span>👑</span>}
        </span>
      </div>

      {!finished && !isBye && (
        <button className="btn btn-primary btn-sm" onClick={onOpen} id={`btn-play-${match.id}`}>
          ▶ Jugar
        </button>
      )}

      {finished && (
        <div className="match-row-status">
          <span className="badge badge-green">✓</span>
        </div>
      )}

      {isBye && !finished && (
        <span className="badge badge-blue">Avanza</span>
      )}

      <style>{`
        .match-row {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md) var(--space-lg);
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          transition: all var(--transition);
        }

        .match-row.clickable {
          cursor: pointer;
        }

        .match-row.clickable:hover {
          border-color: var(--border-accent);
          background: var(--bg-card-hover);
          box-shadow: var(--shadow-green);
        }

        .match-row.finished {
          opacity: 0.75;
        }

        .match-row-round {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          min-width: 80px;
          flex-shrink: 0;
        }

        .match-row-teams {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: var(--space-sm);
          align-items: center;
        }

        .mr-team {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mr-team-right {
          justify-content: flex-end;
          text-align: right;
        }

        .mr-winner {
          color: var(--green-primary);
        }

        .mr-loser {
          color: var(--text-muted);
          font-weight: 400;
        }

        .mr-score {
          text-align: center;
          min-width: 60px;
        }

        .mr-score-val {
          font-size: 16px;
          font-weight: 900;
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
        }

        .match-row-status {
          flex-shrink: 0;
        }

        @media (max-width: 540px) {
          .match-row-round {
            display: none;
          }
          .match-row {
            padding: var(--space-sm) var(--space-md);
          }
        }
      `}</style>
    </div>
  );
}
