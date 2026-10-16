import { useState } from "react";
import type { ScoreGameMatch } from "../../types/scoreGame";
import { loadMatches, persistMatches } from "./storage";

export function useScoreMatches(storageKey: string) {
    const [storedMatches, setStoredMatches] = useState(() => loadMatches(storageKey));
    const [error, setError] = useState<string | null>(null);

    function save(matches: ScoreGameMatch[]): boolean {
        const persistenceError = persistMatches(matches, storageKey);
        if (persistenceError) {
            setError(persistenceError);
            return false;
        }

        setStoredMatches({ matches, error: null });
        setError(null);
        return true;
    }

    function create(
        playerIds: string[],
        gameMode?: ScoreGameMatch["gameMode"],
    ): ScoreGameMatch | null {
        const match: ScoreGameMatch = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            playerIds,
            rounds: [],
            ...(gameMode ? { gameMode } : {}),
        };

        return save([match, ...storedMatches.matches]) ? match : null;
    }

    function update(matchId: string, change: (match: ScoreGameMatch) => ScoreGameMatch): boolean {
        const matches = storedMatches.matches.map((match) =>
            match.id === matchId ? change(match) : match,
        );
        return save(matches);
    }

    function remove(matchId: string): boolean {
        return save(storedMatches.matches.filter((match) => match.id !== matchId));
    }

    return {
        matches: storedMatches.matches,
        loadError: storedMatches.error,
        error,
        setError,
        create,
        update,
        remove,
    };
}
