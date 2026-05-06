// ===================================================
// BracketView — Interactive tournament bracket
// ===================================================

export default function BracketView({ tournament, onOpenMatch }) {
  const { rounds, winner, tournamentName } = tournament;

  if (!rounds.length) return null;

  return (
    <div className="bracket-view animate-in">
      {winner && (
        <div className="winner-banner">
          <div className="winner-trophy">🏆</div>
          <div>
            <p className="winner-label">Campeón del</p>
            <h2 className="winner-name">{winner.name}</h2>
            <p className="winner-sub">{tournamentName}</p>
          </div>
          <div className="winner-trophy">🏆</div>
        </div>
      )}

      <div className="bracket-scroll">
        <div className="bracket-container" id="bracket-export">
          {rounds.map((round, roundIdx) => (
            <div key={round.id} className="bracket-round">
              <div className="round-header">
                <span className="round-name">{round.name}</span>
                <span className="badge badge-gray" style={{ fontSize: 10 }}>
                  {round.matches.filter((m) => m.status === 'finished').length}/{round.matches.length}
                </span>
              </div>
              <div className="round-matches">
                {round.matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isLast={roundIdx === rounds.length - 1}
                    onOpen={() => match.status !== 'finished' && onOpenMatch(match.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .bracket-view {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .winner-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-xl);
          padding: var(--space-xl) var(--space-lg);
          background: linear-gradient(135deg, rgba(0,245,160,0.08) 0%, rgba(255,190,11,0.06) 100%);
          border: 1px solid rgba(255,190,11,0.3);
          border-radius: var(--radius-xl);
          animation: pulse-green 2s infinite;
          text-align: center;
        }

        .winner-trophy {
          font-size: 48px;
          animation: float 2s ease-in-out infinite;
        }

        .winner-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--amber);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .winner-name {
          font-size: 32px;
          font-weight: 900;
          background: linear-gradient(135deg, var(--amber) 0%, var(--green-primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1px;
        }

        .winner-sub {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .bracket-scroll {
          overflow-x: auto;
          padding-bottom: var(--space-md);
        }

        .bracket-container {
          display: flex;
          gap: var(--space-xl);
          align-items: flex-start;
          min-width: max-content;
          padding: var(--space-md);
        }

        .bracket-round {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          min-width: 220px;
        }

        .round-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-sm);
        }

        .round-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--green-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .round-matches {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
      `}</style>
    </div>
  );
}

function MatchCard({ match, onOpen }) {
  const isBye = !match.team2;
  const isPending = match.status === 'pending';
  const isFinished = match.status === 'finished';

  return (
    <div
      className={`match-card ${isPending ? 'clickable' : ''} ${isFinished ? 'finished' : ''}`}
      onClick={isPending && !isBye ? onOpen : undefined}
      id={`match-${match.id}`}
      role={isPending && !isBye ? 'button' : undefined}
      tabIndex={isPending && !isBye ? 0 : undefined}
      onKeyDown={(e) => e.key === 'Enter' && isPending && !isBye && onOpen()}
    >
      <TeamRow
        team={match.team1}
        score={isFinished ? match.score1 : null}
        isWinner={isFinished && match.winner?.id === match.team1?.id}
        isLoser={isFinished && match.winner?.id === match.team2?.id}
      />
      <div className="match-vs">
        {isBye ? (
          <span className="badge badge-blue">BYE</span>
        ) : isFinished ? (
          <span className="match-score-sep">vs</span>
        ) : (
          <div className="match-play-btn">
            <span>▶</span>
          </div>
        )}
      </div>
      <TeamRow
        team={match.team2}
        score={isFinished ? match.score2 : null}
        isWinner={isFinished && match.winner?.id === match.team2?.id}
        isLoser={isFinished && match.winner?.id === match.team1?.id}
        isBye={isBye}
      />

      {isPending && !isBye && (
        <div className="match-cta">Tocar para jugar →</div>
      )}

      <style>{`
        .match-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all var(--transition);
          position: relative;
        }

        .match-card.clickable {
          cursor: pointer;
        }

        .match-card.clickable:hover {
          border-color: var(--border-accent);
          box-shadow: var(--shadow-green);
          transform: translateY(-2px);
        }

        .match-card.finished {
          border-color: rgba(255,255,255,0.08);
        }

        .match-vs {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px var(--space-md);
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(255,255,255,0.02);
        }

        .match-score-sep {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .match-play-btn {
          width: 24px;
          height: 24px;
          background: var(--green-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          color: #0d0d1a;
          animation: pulse-green 2s infinite;
        }

        .match-cta {
          padding: 6px var(--space-md);
          font-size: 11px;
          font-weight: 600;
          color: var(--green-primary);
          text-align: center;
          opacity: 0;
          transition: opacity var(--transition);
        }

        .match-card.clickable:hover .match-cta {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

function TeamRow({ team, score, isWinner, isLoser, isBye }) {
  if (!team || isBye) {
    return (
      <div className="team-row bye">
        <span className="team-row-name text-muted">— Bye —</span>
      </div>
    );
  }

  return (
    <div className={`team-row ${isWinner ? 'winner' : ''} ${isLoser ? 'loser' : ''}`}>
      <div className="team-row-left">
        {isWinner && <span className="winner-crown">👑</span>}
        <span className="team-row-name">{team.name}</span>
      </div>
      {score !== null && (
        <span className={`team-row-score ${isWinner ? 'score-winner' : ''}`}>{score}</span>
      )}

      <style>{`
        .team-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px var(--space-md);
          transition: background var(--transition);
          gap: var(--space-sm);
        }

        .team-row.bye {
          opacity: 0.4;
        }

        .team-row.winner {
          background: rgba(0, 245, 160, 0.06);
        }

        .team-row.loser {
          opacity: 0.5;
        }

        .team-row-left {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 0;
        }

        .team-row-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .team-row.loser .team-row-name {
          color: var(--text-secondary);
        }

        .team-row.winner .team-row-name {
          color: var(--green-primary);
        }

        .winner-crown {
          font-size: 12px;
          flex-shrink: 0;
        }

        .team-row-score {
          font-size: 18px;
          font-weight: 900;
          color: var(--text-secondary);
          font-variant-numeric: tabular-nums;
          min-width: 24px;
          text-align: right;
          flex-shrink: 0;
        }

        .score-winner {
          color: var(--green-primary);
        }
      `}</style>
    </div>
  );
}
