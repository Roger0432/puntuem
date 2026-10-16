export type ScoreRound = {
    id: string;
    scores: Record<string, number | null>;
    bids?: Record<string, number | null>;
    tricks?: Record<string, number | null>;
    capturedPirates?: Record<string, number | null>;
    mermaidCapturedSkullKing?: Record<string, boolean>;
};

export type ScoreGameMatch = {
    id: string;
    createdAt: string;
    playerIds: string[];
    rounds: ScoreRound[];
    gameMode?: "skull-king";
};
