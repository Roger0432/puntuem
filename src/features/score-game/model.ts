import type { Player } from "../../types/player";
import type { ScoreGameMatch, ScoreRound } from "../../types/scoreGame";

export function getMatchTotals(match: ScoreGameMatch): Record<string, number> {
    return Object.fromEntries(
        match.playerIds.map((playerId) => [
            playerId,
            match.rounds.reduce((total, round) => total + (round.scores[playerId] ?? 0), 0),
        ]),
    );
}

export function isMatchFinished(match: ScoreGameMatch, scoreLimit = 100): boolean {
    if (match.rounds.length === 0 || match.playerIds.length === 0) return false;

    if (match.gameMode === "skull-king") {
        return match.rounds.length === 10 && match.rounds.every((round) =>
            match.playerIds.every((playerId) =>
                Number.isInteger(round.bids?.[playerId]) &&
                Number.isInteger(round.tricks?.[playerId]) &&
                Number.isInteger(round.scores[playerId]),
            ),
        );
    }

    const roundsAreComplete = match.rounds.every((round) =>
        match.playerIds.every((playerId) => Number.isInteger(round.scores[playerId])),
    );

    return roundsAreComplete && Object.values(getMatchTotals(match)).some((total) => total >= scoreLimit);
}

export function getMatchWinners(
    match: ScoreGameMatch,
    players: Player[],
    scoreLimit = 100,
): Player[] {
    if (!isMatchFinished(match, scoreLimit)) return [];

    const totals = getMatchTotals(match);
    const winningTotal = match.gameMode === "skull-king"
        ? Math.max(...Object.values(totals))
        : Math.min(...Object.values(totals));
    return match.playerIds
        .filter((playerId) => totals[playerId] === winningTotal)
        .map((playerId) => players.find((player) => player.id === playerId))
        .filter((player): player is Player => player !== undefined);
}

export function getRoundWinners(round: ScoreRound, playerIds: string[], players: Player[]): Player[] {
    return getRoundLeaders(round, playerIds, players, false);
}

export function getRoundPointLeaders(round: ScoreRound, playerIds: string[], players: Player[]): Player[] {
    return getRoundLeaders(round, playerIds, players, true);
}

function getRoundLeaders(
    round: ScoreRound,
    playerIds: string[],
    players: Player[],
    highestWins: boolean,
): Player[] {
    const scores = playerIds
        .map((playerId) => ({ playerId, score: round.scores[playerId] }))
        .filter((entry): entry is { playerId: string; score: number } =>
            typeof entry.score === "number",
        );

    if (scores.length !== playerIds.length || scores.length === 0) return [];

    const winningScore = highestWins
        ? Math.max(...scores.map((entry) => entry.score))
        : Math.min(...scores.map((entry) => entry.score));
    return scores
        .filter((entry) => entry.score === winningScore)
        .map((entry) => players.find((player) => player.id === entry.playerId))
        .filter((player): player is Player => player !== undefined);
}

export function getSkullKingRoundScore(
    roundNumber: number,
    bid: number,
    tricks: number,
    capturedPirates: number,
    mermaidCapturedSkullKing: boolean,
): number {
    if (bid === 0) {
        return tricks === 0 ? roundNumber * 10 : -roundNumber * 10;
    }

    if (bid !== tricks) return -Math.abs(bid - tricks) * 10;

    return bid * 20 + capturedPirates * 30 + (mermaidCapturedSkullKing ? 50 : 0);
}

export function formatMatchDate(date: string): string {
    return new Intl.DateTimeFormat("ca-ES", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
}
