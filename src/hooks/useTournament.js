// ===================================================
// useTournament — Core state management with localStorage
// ===================================================

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'canchero_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn('localStorage not available');
  }
}

const defaultState = {
  teams: [],
  rounds: [],
  tournamentName: 'Mi Campeonato',
  status: 'setup', // 'setup' | 'active' | 'finished'
  winner: null,
  currentMatchId: null,
};

export function useTournament() {
  const [state, setState] = useState(() => {
    const saved = loadState();
    return saved || defaultState;
  });

  const update = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveState(next);
      return next;
    });
  }, []);

  // --- Teams ---
  const addTeam = useCallback((name) => {
    if (!name.trim()) return;
    update((s) => ({
      ...s,
      teams: [
        ...s.teams,
        { id: crypto.randomUUID(), name: name.trim() },
      ],
    }));
  }, [update]);

  const removeTeam = useCallback((id) => {
    update((s) => ({ ...s, teams: s.teams.filter((t) => t.id !== id) }));
  }, [update]);

  const setTournamentName = useCallback((name) => {
    update((s) => ({ ...s, tournamentName: name }));
  }, [update]);

  // --- Generate Bracket ---
  const generateBracket = useCallback(() => {
    update((s) => {
      const shuffled = [...s.teams].sort(() => Math.random() - 0.5);

      // Pad to next power of 2
      const size = Math.pow(2, Math.ceil(Math.log2(shuffled.length)));
      while (shuffled.length < size) shuffled.push(null); // byes

      const matches = [];
      for (let i = 0; i < size; i += 2) {
        const t1 = shuffled[i];
        const t2 = shuffled[i + 1];
        matches.push({
          id: crypto.randomUUID(),
          team1: t1,
          team2: t2,
          score1: 0,
          score2: 0,
          winner: t2 === null ? t1 : null, // auto-advance on bye
          status: t2 === null ? 'finished' : 'pending',
        });
      }

      const round1 = { id: crypto.randomUUID(), name: getRoundName(size / 2), matches };

      return {
        ...s,
        rounds: [round1],
        status: 'active',
        winner: null,
        currentMatchId: null,
      };
    });
  }, [update]);

  // --- Advance round ---
  const advanceRound = useCallback((rounds) => {
    const lastRound = rounds[rounds.length - 1];
    const winners = lastRound.matches.map((m) => m.winner).filter(Boolean);
    if (winners.length !== lastRound.matches.length) return rounds; // not all done

    if (winners.length === 1) return rounds; // tournament done

    const newMatches = [];
    for (let i = 0; i < winners.length; i += 2) {
      const t1 = winners[i];
      const t2 = winners[i + 1] || null;
      newMatches.push({
        id: crypto.randomUUID(),
        team1: t1,
        team2: t2,
        score1: 0,
        score2: 0,
        winner: t2 === null ? t1 : null,
        status: t2 === null ? 'finished' : 'pending',
      });
    }

    return [
      ...rounds,
      { id: crypto.randomUUID(), name: getRoundName(winners.length / 2), matches: newMatches },
    ];
  }, []);

  // --- Submit score ---
  const submitScore = useCallback((matchId, score1, score2) => {
    update((s) => {
      const newRounds = s.rounds.map((round) => ({
        ...round,
        matches: round.matches.map((m) => {
          if (m.id !== matchId) return m;
          const winner = score1 > score2 ? m.team1 : score2 > score1 ? m.team2 : null;
          return { ...m, score1, score2, winner, status: winner ? 'finished' : 'draw' };
        }),
      }));

      const advanced = advanceRound(newRounds);

      // Check global winner
      const lastRound = advanced[advanced.length - 1];
      const allDone = lastRound.matches.every((m) => m.status === 'finished');
      const globalWinner =
        allDone && lastRound.matches.length === 1 ? lastRound.matches[0].winner : null;

      return {
        ...s,
        rounds: advanced,
        currentMatchId: null,
        status: globalWinner ? 'finished' : s.status,
        winner: globalWinner,
      };
    });
  }, [update, advanceRound]);

  // --- Live match ---
  const openMatch = useCallback((matchId) => {
    update((s) => ({ ...s, currentMatchId: matchId }));
  }, [update]);

  const closeMatch = useCallback(() => {
    update((s) => ({ ...s, currentMatchId: null }));
  }, [update]);

  // --- Reset ---
  const resetTournament = useCallback(() => {
    update({ ...defaultState });
  }, [update]);

  const resetToSetup = useCallback(() => {
    update((s) => ({ ...s, rounds: [], status: 'setup', winner: null, currentMatchId: null }));
  }, [update]);

  // Derived
  const currentMatch = state.rounds
    .flatMap((r) => r.matches)
    .find((m) => m.id === state.currentMatchId) || null;

  return {
    ...state,
    currentMatch,
    addTeam,
    removeTeam,
    setTournamentName,
    generateBracket,
    submitScore,
    openMatch,
    closeMatch,
    resetTournament,
    resetToSetup,
  };
}

function getRoundName(matchCount) {
  switch (matchCount) {
    case 1: return 'Final';
    case 2: return 'Semifinal';
    case 4: return 'Cuartos de Final';
    case 8: return 'Octavos de Final';
    case 16: return 'Dieciseisavos';
    default: return `Ronda de ${matchCount * 2}`;
  }
}
