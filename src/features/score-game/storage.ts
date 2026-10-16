import type { ScoreGameMatch, ScoreRound } from "../../types/scoreGame";

export const skyjoMatchesStorageKey = "puntuem.skyjo.matches.v1";

export type MatchLoadResult = {
    matches: ScoreGameMatch[];
    error: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isScoreRound(value: unknown): value is ScoreRound {
    if (!isRecord(value) || typeof value.id !== "string" || !isRecord(value.scores)) {
        return false;
    }

    return (
        isNullableIntegerRecord(value.scores) &&
        isOptionalNullableIntegerRecord(value.bids) &&
        isOptionalNullableIntegerRecord(value.tricks) &&
        isOptionalNullableIntegerRecord(value.capturedPirates) &&
        isOptionalBooleanRecord(value.mermaidCapturedSkullKing)
    );
}

function isNullableIntegerRecord(value: unknown): value is Record<string, number | null> {
    return isRecord(value) && Object.values(value).every(
        (score) => score === null || (typeof score === "number" && Number.isInteger(score)),
    );
}

function isOptionalNullableIntegerRecord(value: unknown): boolean {
    return value === undefined || isNullableIntegerRecord(value);
}

function isOptionalBooleanRecord(value: unknown): boolean {
    return value === undefined || (
        isRecord(value) && Object.values(value).every((flag) => typeof flag === "boolean")
    );
}

function isScoreGameMatch(value: unknown): value is ScoreGameMatch {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        typeof value.createdAt === "string" &&
        (value.gameMode === undefined || value.gameMode === "skull-king") &&
        Array.isArray(value.playerIds) &&
        value.playerIds.every((id) => typeof id === "string") &&
        Array.isArray(value.rounds) &&
        value.rounds.every(isScoreRound)
    );
}

export function loadMatches(storageKey = skyjoMatchesStorageKey): MatchLoadResult {
    try {
        const storedMatches = window.localStorage.getItem(storageKey);
        if (storedMatches === null) return { matches: [], error: null };

        const parsed: unknown = JSON.parse(storedMatches);
        if (!Array.isArray(parsed) || !parsed.every(isScoreGameMatch)) {
            throw new Error("Les dades de les partides no tenen un format vàlid.");
        }

        return { matches: parsed, error: null };
    } catch (error) {
        const detail = error instanceof Error ? error.message : "Error desconegut";
        return {
            matches: [],
            error: `No s'han pogut carregar les partides: ${detail}`,
        };
    }
}

export function persistMatches(
    matches: ScoreGameMatch[],
    storageKey = skyjoMatchesStorageKey,
): string | null {
    try {
        window.localStorage.setItem(storageKey, JSON.stringify(matches));
        return null;
    } catch (error) {
        const detail = error instanceof Error ? error.message : "Error desconegut";
        return `No s'han pogut desar els canvis: ${detail}`;
    }
}
