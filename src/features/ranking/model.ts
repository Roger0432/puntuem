import type { Player } from "../../types/player";
import type { ScoreGameMatch } from "../../types/scoreGame";
import { getMatchWinners } from "../score-game/model";
import { skullKingRounds } from "../skull-king/config";
import { toma6ScoreLimit } from "../toma6/config";

export function getGlobalRanking(
    players: Player[],
    skyjoMatches: ScoreGameMatch[],
    toma6Matches: ScoreGameMatch[] = [],
    skullKingMatches: ScoreGameMatch[] = [],
) {
    const wins = Object.fromEntries(players.map((player) => [player.id, 0])) as Record<string, number>;

    for (const [matches, scoreLimit] of [
        [skyjoMatches, 100],
        [toma6Matches, toma6ScoreLimit],
        [skullKingMatches, skullKingRounds],
    ] as const) {
        for (const match of matches) {
            for (const winner of getMatchWinners(match, players, scoreLimit)) {
                wins[winner.id] = (wins[winner.id] ?? 0) + 1;
            }
        }
    }

    const rankedPlayers = [...players].sort(
        (first, second) =>
            (wins[second.id] ?? 0) - (wins[first.id] ?? 0) ||
            first.name.localeCompare(second.name, "ca"),
    );

    return {
        rankedPlayers,
        wins,
        podiumPlayers: rankedPlayers.slice(0, 3),
        remainingPlayers: rankedPlayers.slice(3),
    };
}
