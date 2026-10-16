import { useState } from "react";
import type { ChangeEvent } from "react";
import type { Player } from "../../types/player";
import type { ScoreGameMatch, ScoreRound } from "../../types/scoreGame";
import {
    formatMatchDate,
    getMatchTotals,
    getMatchWinners,
    getRoundPointLeaders,
    getRoundWinners,
    getSkullKingRoundScore,
    isMatchFinished,
} from "./model";
import { useScoreMatches } from "./useScoreMatches";
import "./ScoreGamePage.css";

type ScoreGamePageProps = {
    players: Player[];
    gameName: string;
    gameCover: string;
    gameSummary: string;
    scoreLimit: number;
    storageKey: string;
    gameMode?: ScoreGameMatch["gameMode"];
};

type SkullKingInputField = "bid" | "tricks" | "capturedPirates" | "mermaidCapturedSkullKing";
type ScoreInputChange = (
    roundId: string,
    playerId: string,
    value: string,
    field?: SkullKingInputField,
) => void;

function recalculateSkullKingRound(round: ScoreRound, roundNumber: number, playerIds: string[]): ScoreRound {
    return {
        ...round,
        scores: Object.fromEntries(playerIds.map((playerId) => {
            const bid = round.bids?.[playerId];
            const tricks = round.tricks?.[playerId];
            const score = typeof bid === "number" && Number.isInteger(bid) &&
                typeof tricks === "number" && Number.isInteger(tricks)
                ? getSkullKingRoundScore(
                    roundNumber,
                    bid,
                    tricks,
                    round.capturedPirates?.[playerId] ?? 0,
                    round.mermaidCapturedSkullKing?.[playerId] ?? false,
                )
                : null;
            return [playerId, score];
        })),
    };
}

function PlayerSelector({
    players,
    selectedIds,
    onToggle,
    compact = false,
}: {
    players: Player[];
    selectedIds: string[];
    onToggle: (playerId: string) => void;
    compact?: boolean;
}) {
    return (
        <div className={`player-selector${compact ? " compact" : ""}`}>
            {players.map((player) => (
                <label className={`player-chip ${selectedIds.includes(player.id) ? "selected" : ""}`} key={player.id}>
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(player.id)}
                        onChange={() => onToggle(player.id)}
                    />
                    <img src={player.avatar} alt="" />
                    <span>{player.name}</span>
                </label>
            ))}
        </div>
    );
}

function SkullKingScoreInputs({
    match,
    round,
    roundIndex,
    player,
    onChange,
}: {
    match: ScoreGameMatch;
    round: ScoreRound;
    roundIndex: number;
    player: Player;
    onChange: ScoreInputChange;
}) {
    const bidId = `bid-${match.id}-${round.id}-${player.id}`;
    const tricksId = `tricks-${match.id}-${round.id}-${player.id}`;
    const piratesId = `pirates-${match.id}-${round.id}-${player.id}`;
    const score = round.scores[player.id];

    return (
        <div className="skull-king-score-inputs">
            <label htmlFor={bidId}>Aposta</label>
            <input
                id={bidId}
                className="score-input skull-king-input"
                type="number"
                min="0"
                max={roundIndex + 1}
                step="1"
                value={round.bids?.[player.id] ?? ""}
                onChange={(event) => onChange(round.id, player.id, event.target.value, "bid")}
            />
            <label htmlFor={tricksId}>Guanyades</label>
            <input
                id={tricksId}
                className="score-input skull-king-input"
                type="number"
                min="0"
                max={roundIndex + 1}
                step="1"
                value={round.tricks?.[player.id] ?? ""}
                onChange={(event) => onChange(round.id, player.id, event.target.value, "tricks")}
            />
            <label htmlFor={piratesId}>Pirates capturats amb el Skull King (inclosa Scary Mary)</label>
            <input
                id={piratesId}
                className="score-input skull-king-input"
                type="number"
                min="0"
                max="5"
                step="1"
                value={round.capturedPirates?.[player.id] ?? 0}
                onChange={(event) =>
                    onChange(round.id, player.id, event.target.value, "capturedPirates")
                }
            />
            <label className="skull-king-mermaid">
                <input
                    type="checkbox"
                    checked={round.mermaidCapturedSkullKing?.[player.id] ?? false}
                    onChange={(event) =>
                        onChange(
                            round.id,
                            player.id,
                            event.target.checked ? "1" : "0",
                            "mermaidCapturedSkullKing",
                        )
                    }
                />
                Sirena captura el Skull King (+50)
            </label>
            <strong className={`skull-king-round-score${typeof score === "number" && score > 0 ? " positive" : typeof score === "number" && score < 0 ? " negative" : ""}`}>
                {score === null || score === undefined ? "—" : score > 0 ? `+${score}` : score}
            </strong>
        </div>
    );
}

function RoundScoreTable({
    match,
    players,
    onScoreChange,
    onDeleteRound,
    scoreMode,
}: {
    match: ScoreGameMatch;
    players: Player[];
    onScoreChange: ScoreInputChange;
    onDeleteRound: (roundId: string, roundNumber: number) => void;
    scoreMode?: ScoreGameMatch["gameMode"];
}) {
    const matchPlayers = match.playerIds
        .map((id) => players.find((player) => player.id === id))
        .filter((player): player is Player => player !== undefined);
    const totals = getMatchTotals(match);

    return (
        <div className="round-table-wrap">
            <table className="round-table">
                <thead>
                    <tr>
                        <th>Ronda</th>
                        {matchPlayers.map((player) => (
                            <th key={player.id}>
                                <span className="player-column-heading">
                                    <img src={player.avatar} alt="" />
                                    <span>{player.name}</span>
                                </span>
                            </th>
                        ))}
                        <th>{scoreMode === "skull-king" ? "Més punts" : "Guanyador"}</th>
                    </tr>
                </thead>
                <tbody>
                    {match.rounds.map((round, roundIndex) => (
                        <tr key={round.id}>
                            <th className="round-number-cell" scope="row">
                                <span>{roundIndex + 1}</span>
                                <button
                                    className="round-delete-button"
                                    type="button"
                                    aria-label={`Elimina la ronda ${roundIndex + 1}`}
                                    title={`Elimina la ronda ${roundIndex + 1}`}
                                    onClick={() => onDeleteRound(round.id, roundIndex + 1)}
                                >
                                    <svg aria-hidden="true" viewBox="0 0 24 24">
                                        <path d="M3 6h18M8 6V4h8v2m3 0-.9 14H5.9L5 6m4 4v6m6-6v6" />
                                    </svg>
                                </button>
                            </th>
                            {matchPlayers.map((player) => (
                                <td key={player.id}>
                                    {scoreMode === "skull-king" ? (
                                        <SkullKingScoreInputs
                                            match={match}
                                            round={round}
                                            roundIndex={roundIndex}
                                            player={player}
                                            onChange={onScoreChange}
                                        />
                                    ) : (
                                        <>
                                            <label className="visually-hidden" htmlFor={`score-${match.id}-${round.id}-${player.id}`}>
                                                Punts de {player.name}, ronda {roundIndex + 1}
                                            </label>
                                            <input
                                                id={`score-${match.id}-${round.id}-${player.id}`}
                                                className="score-input"
                                                type="number"
                                                step="1"
                                                value={round.scores[player.id] ?? ""}
                                                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                                    onScoreChange(round.id, player.id, event.target.value)
                                                }
                                            />
                                        </>
                                    )}
                                </td>
                            ))}
                            <td className="round-winner">
                                {(
                                    scoreMode === "skull-king"
                                        ? getRoundPointLeaders(round, match.playerIds, players)
                                        : getRoundWinners(round, match.playerIds, players)
                                ).map((player) => player.name).join(" · ") || "—"}
                            </td>
                        </tr>
                    ))}
                    <tr className="totals-row">
                        <th scope="row">Total</th>
                        {matchPlayers.map((player) => <td key={player.id}>{totals[player.id] ?? 0}</td>)}
                        <td>—</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

function MatchEditor({
    match,
    players,
    scoreLimit,
    onSavePlayers,
    onScoreChange,
    onDeleteRound,
    onAddRound,
    onDelete,
    scoreMode,
}: {
    match: ScoreGameMatch;
    players: Player[];
    scoreLimit: number;
    onSavePlayers: (playerIds: string[]) => void;
    onScoreChange: ScoreInputChange;
    onDeleteRound: (roundId: string, roundNumber: number) => void;
    onAddRound: () => void;
    onDelete: () => void;
    scoreMode?: ScoreGameMatch["gameMode"];
}) {
    const finished = isMatchFinished(match, scoreLimit);
    const winners = getMatchWinners(match, players, scoreLimit);
    const [editingPlayers, setEditingPlayers] = useState(false);
    const [draftPlayerIds, setDraftPlayerIds] = useState(match.playerIds);

    function toggleDraftPlayer(playerId: string) {
        setDraftPlayerIds((current) =>
            current.includes(playerId)
                ? current.filter((id) => id !== playerId)
                : [...current, playerId],
        );
    }

    function cancelPlayerChanges() {
        setDraftPlayerIds(match.playerIds);
        setEditingPlayers(false);
    }

    function savePlayerChanges() {
        if (draftPlayerIds.length < 2) return;
        onSavePlayers(draftPlayerIds);
        setEditingPlayers(false);
    }

    return (
        <div className="match-editor">
            <div className="match-editor-heading">
                <h3>Jugadors</h3>
                <div className="match-editor-actions">
                    {!editingPlayers && (
                        <button
                            className="icon-button"
                            type="button"
                            onClick={() => {
                                setDraftPlayerIds(match.playerIds);
                                setEditingPlayers(true);
                            }}
                            aria-label="Edita jugadors"
                            title="Edita jugadors"
                        >
                            <svg aria-hidden="true" viewBox="0 0 24 24">
                                <path d="m16.862 3.487 3.651 3.651M4 20l4.23-.846L19.1 8.284a2.583 2.583 0 0 0-3.652-3.652L4.578 15.502 4 20Z" />
                            </svg>
                        </button>
                    )}
                    <button
                        className="icon-button danger"
                        type="button"
                        onClick={onDelete}
                        aria-label="Elimina partida"
                        title="Elimina partida"
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M3 6h18M8 6V4h8v2m3 0-.9 14H5.9L5 6m4 4v6m6-6v6" />
                        </svg>
                    </button>
                </div>
            </div>
            {editingPlayers && (
                <section className="roster-editor" aria-label="Edita els jugadors de la partida">
                    <PlayerSelector
                        players={players}
                        selectedIds={draftPlayerIds}
                        onToggle={toggleDraftPlayer}
                        compact
                    />
                    <div className="roster-editor-actions">
                        <span>{draftPlayerIds.length} seleccionats</span>
                        <button className="text-button secondary" type="button" onClick={cancelPlayerChanges}>
                            Cancel·la
                        </button>
                        <button
                            className="primary-button"
                            type="button"
                            onClick={savePlayerChanges}
                            disabled={draftPlayerIds.length < 2}
                        >
                            Desa canvis
                        </button>
                    </div>
                </section>
            )}
            {match.rounds.length > 0 && (
                <RoundScoreTable
                    match={match}
                    players={players}
                    onScoreChange={onScoreChange}
                    onDeleteRound={onDeleteRound}
                    scoreMode={scoreMode}
                />
            )}
            {finished && (
                <section
                    className="match-winner-card"
                    aria-label={`${winners.length === 1 ? "Guanyador" : "Guanyadors"}: ${winners.map((player) => player.name).join(" i ")}`}
                >
                    <span className="winner-label">{winners.length === 1 ? "Guanyador" : "Guanyadors"}</span>
                    <div className="winner-photos" aria-hidden="true">
                        {winners.map((player) => (
                            <img key={player.id} src={player.avatar} alt="" />
                        ))}
                    </div>
                    <strong className="winner-name">{winners.map((player) => player.name).join(" i ")}</strong>
                </section>
            )}
            {!finished && !(scoreMode === "skull-king" && match.rounds.length >= 10) && (
                <button
                    className="secondary-button"
                    type="button"
                    onClick={onAddRound}
                    disabled={match.playerIds.length < 2}
                >
                    + Afegeix ronda
                </button>
            )}
        </div>
    );
}

function MatchCard({
    match,
    players,
    scoreLimit,
    expanded,
    scoreMode,
    onToggleExpanded,
    onUpdate,
    onDelete,
}: {
    match: ScoreGameMatch;
    players: Player[];
    scoreLimit: number;
    expanded: boolean;
    scoreMode?: ScoreGameMatch["gameMode"];
    onToggleExpanded: () => void;
    onUpdate: (change: (match: ScoreGameMatch) => ScoreGameMatch) => boolean;
    onDelete: () => void;
}) {
    const finished = isMatchFinished(match, scoreLimit);
    const winners = getMatchWinners(match, players, scoreLimit);
    const matchPlayers = match.playerIds
        .map((id) => players.find((player) => player.id === id))
        .filter((player): player is Player => player !== undefined);

    function addRound() {
        if (scoreMode === "skull-king" && match.rounds.length >= 10) return;

        const round: ScoreRound = {
            id: crypto.randomUUID(),
            scores: Object.fromEntries(match.playerIds.map((playerId) => [playerId, null])),
            ...(scoreMode === "skull-king" ? {
                bids: Object.fromEntries(match.playerIds.map((playerId) => [playerId, null])),
                tricks: Object.fromEntries(match.playerIds.map((playerId) => [playerId, null])),
                capturedPirates: Object.fromEntries(match.playerIds.map((playerId) => [playerId, 0])),
                mermaidCapturedSkullKing: Object.fromEntries(match.playerIds.map((playerId) => [playerId, false])),
            } : {}),
        };
        onUpdate((current) => ({ ...current, rounds: [...current.rounds, round] }));
    }

    function updateScore(roundId: string, playerId: string, value: string, field?: SkullKingInputField) {
        if (scoreMode === "skull-king" && field) {
            const roundNumber = match.rounds.findIndex((round) => round.id === roundId) + 1;
            const parsedNumber = value === "" ? null : Number(value);
            if (field !== "mermaidCapturedSkullKing" && parsedNumber !== null) {
                const max = field === "bid" || field === "tricks" ? roundNumber : 5;
                if (!Number.isInteger(parsedNumber) || parsedNumber < 0 || parsedNumber > max) return;
            }

            onUpdate((current) => ({
                ...current,
                rounds: current.rounds.map((round, index) => {
                    if (round.id !== roundId) return round;

                    const updatedRound = field === "bid"
                        ? { ...round, bids: { ...round.bids, [playerId]: parsedNumber } }
                        : field === "tricks"
                            ? { ...round, tricks: { ...round.tricks, [playerId]: parsedNumber } }
                            : field === "capturedPirates"
                                ? { ...round, capturedPirates: { ...round.capturedPirates, [playerId]: parsedNumber } }
                                : {
                                    ...round,
                                    mermaidCapturedSkullKing: {
                                        ...round.mermaidCapturedSkullKing,
                                        [playerId]: value === "1",
                                    },
                                };
                    const bid = updatedRound.bids?.[playerId];
                    const tricks = updatedRound.tricks?.[playerId];
                    const pirateCaptures = updatedRound.capturedPirates?.[playerId] ?? 0;
                    const mermaidCapture = updatedRound.mermaidCapturedSkullKing?.[playerId] ?? false;
                    const score = typeof bid === "number" && Number.isInteger(bid) &&
                        typeof tricks === "number" && Number.isInteger(tricks)
                        ? getSkullKingRoundScore(index + 1, bid, tricks, pirateCaptures, mermaidCapture)
                        : null;
                    return {
                        ...updatedRound,
                        scores: { ...round.scores, [playerId]: score },
                    };
                }),
            }));
            return;
        }

        const score = value === "" ? null : Number(value);
        if (score !== null && !Number.isInteger(score)) return;

        onUpdate((current) => ({
            ...current,
            rounds: current.rounds.map((round) =>
                round.id === roundId
                    ? { ...round, scores: { ...round.scores, [playerId]: score } }
                    : round,
            ),
        }));
    }

    function deleteRound(roundId: string, roundNumber: number) {
        const round = match.rounds.find((current) => current.id === roundId);
        if (!round) return;

        const hasScores = Object.values(round.scores).some((score) => typeof score === "number");
        const hasBidsOrTricks = Object.values(round.bids ?? {}).some((value) => typeof value === "number") ||
            Object.values(round.tricks ?? {}).some((value) => typeof value === "number");
        if ((hasScores || hasBidsOrTricks) &&
            !window.confirm(`Vols eliminar la ronda ${roundNumber} i les seves puntuacions?`)) {
            return;
        }

        onUpdate((current) => {
            const remainingRounds = current.rounds.filter((currentRound) => currentRound.id !== roundId);
            return {
                ...current,
                rounds: scoreMode === "skull-king"
                    ? remainingRounds.map((currentRound, index) =>
                        recalculateSkullKingRound(currentRound, index + 1, current.playerIds),
                    )
                    : remainingRounds,
            };
        });
    }

    function savePlayers(playerIds: string[]) {
        onUpdate((current) => ({
            ...current,
            playerIds,
            rounds: current.rounds.map((round) => {
                const scores = Object.fromEntries(
                    playerIds.map((playerId) => [
                        playerId,
                        round.scores[playerId] ?? null,
                    ]),
                );
                if (scoreMode !== "skull-king") return { ...round, scores };

                return {
                    ...round,
                    scores: Object.fromEntries(
                        playerIds.map((playerId) => [
                            playerId,
                            current.playerIds.includes(playerId) ? round.scores[playerId] ?? null : null,
                        ]),
                    ),
                    bids: Object.fromEntries(
                        playerIds.map((playerId) => [playerId, round.bids?.[playerId] ?? null]),
                    ),
                    tricks: Object.fromEntries(
                        playerIds.map((playerId) => [playerId, round.tricks?.[playerId] ?? null]),
                    ),
                    capturedPirates: Object.fromEntries(
                        playerIds.map((playerId) => [playerId, round.capturedPirates?.[playerId] ?? 0]),
                    ),
                    mermaidCapturedSkullKing: Object.fromEntries(
                        playerIds.map((playerId) => [playerId, round.mermaidCapturedSkullKing?.[playerId] ?? false]),
                    ),
                };
            }),
        }));
    }

    return (
        <article className="match-card">
            <button className="match-summary" type="button" onClick={onToggleExpanded} aria-expanded={expanded}>
                <span className={`match-status ${finished ? "finished" : "in-progress"}`}>
                    {finished ? "Acabada" : "En curs"}
                </span>
                <span className="match-date">{formatMatchDate(match.createdAt)}</span>
                <span className="match-players">{matchPlayers.map((player) => player.name).join(", ")}</span>
                <span className="match-result">
                    {finished
                        ? `Guanya ${winners.map((player) => player.name).join(" i ")}`
                        : scoreMode === "skull-king"
                            ? `${match.rounds.length}/10 rondes`
                            : `${match.rounds.length} rondes`}
                </span>
                <span className="match-chevron" aria-hidden="true">{expanded ? "−" : "+"}</span>
            </button>
            {expanded && (
                <MatchEditor
                    match={match}
                    players={players}
                    scoreLimit={scoreLimit}
                    scoreMode={scoreMode}
                    onSavePlayers={savePlayers}
                    onScoreChange={updateScore}
                    onDeleteRound={deleteRound}
                    onAddRound={addRound}
                    onDelete={onDelete}
                />
            )}
        </article>
    );
}

export function ScoreGamePage({
    players,
    gameName,
    gameCover,
    gameSummary,
    scoreLimit,
    storageKey,
    gameMode,
}: ScoreGamePageProps) {
    const sortedPlayers = [...players].sort((first, second) =>
        first.name.localeCompare(second.name, "ca"),
    );
    const matchesState = useScoreMatches(storageKey);
    const [selectedPlayerIds, setSelectedPlayerIds] = useState(() => players.map((player) => player.id));
    const [showNewMatch, setShowNewMatch] = useState(false);
    const [showGameSummary, setShowGameSummary] = useState(false);
    const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    function toggleNewPlayer(playerId: string) {
        setSelectedPlayerIds((current) =>
            current.includes(playerId)
                ? current.filter((id) => id !== playerId)
                : [...current, playerId],
        );
        setValidationError(null);
    }

    function startMatch() {
        if (selectedPlayerIds.length < 2) {
            setValidationError("Selecciona com a mínim dos jugadors.");
            return;
        }

        const match = matchesState.create(selectedPlayerIds, gameMode);
        if (match) {
            setShowNewMatch(false);
            setExpandedMatchId(match.id);
        }
    }

    function deleteMatch(match: ScoreGameMatch) {
        if (!window.confirm(`Vols eliminar la partida del ${formatMatchDate(match.createdAt)}?`)) return;
        if (matchesState.remove(match.id) && expandedMatchId === match.id) {
            setExpandedMatchId(null);
        }
    }

    const orderedMatches = [...matchesState.matches].sort(
        (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    );

    return (
        <section className="score-game-page" aria-labelledby="score-game-title">
            <div className="section-heading">
                <div className="score-game-title-group">
                    <a className="back-link" href="#jocs">← Jocs</a>
                    <div className="score-game-title-row">
                        <img className="score-game-cover" src={gameCover} alt={`Portada de ${gameName}`} />
                        <h1 id="score-game-title">{gameName}</h1>
                        <button
                            className="game-help-button"
                            type="button"
                            aria-label={`${showGameSummary ? "Amaga" : "Mostra"} el resum de ${gameName}`}
                            aria-expanded={showGameSummary}
                            aria-controls="score-game-summary"
                            onClick={() => setShowGameSummary((current) => !current)}
                        >
                            ?
                        </button>
                    </div>
                </div>
                <button
                    className="primary-button"
                    type="button"
                    onClick={() => {
                        setShowNewMatch((current) => !current);
                        setValidationError(null);
                    }}
                >
                    + Iniciar partida nova
                </button>
            </div>

            {showGameSummary && (
                <p className="score-game-summary" id="score-game-summary">
                    {gameSummary}
                </p>
            )}

            {matchesState.loadError && <p className="form-message error-message" role="alert">{matchesState.loadError}</p>}
            {matchesState.error && <p className="form-message error-message" role="alert">{matchesState.error}</p>}
            {validationError && <p className="form-message error-message" role="alert">{validationError}</p>}

            {showNewMatch && (
                <section className="new-match-panel" aria-labelledby="new-match-title">
                    <h2 id="new-match-title">Selecciona els jugadors</h2>
                    <PlayerSelector
                        players={sortedPlayers}
                        selectedIds={selectedPlayerIds}
                        onToggle={toggleNewPlayer}
                    />
                    <div className="setup-actions">
                        <span>{selectedPlayerIds.length} jugadors</span>
                        <button className="primary-button" type="button" onClick={startMatch}>
                            Començar partida
                        </button>
                    </div>
                </section>
            )}

            <div className="history-heading">
                <h2>Últimes partides</h2>
                <span>{orderedMatches.length}</span>
            </div>
            {orderedMatches.length === 0 ? (
                <p className="history-empty">Encara no hi ha partides.</p>
            ) : (
                <div className="match-history">
                    {orderedMatches.map((match) => (
                        <MatchCard
                            key={match.id}
                            match={match}
                            players={sortedPlayers}
                            scoreLimit={scoreLimit}
                            scoreMode={gameMode}
                            expanded={expandedMatchId === match.id}
                            onToggleExpanded={() => setExpandedMatchId(
                                expandedMatchId === match.id ? null : match.id,
                            )}
                            onUpdate={(change) => matchesState.update(match.id, change)}
                            onDelete={() => deleteMatch(match)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
