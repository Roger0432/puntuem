import type { Player } from "../../types/player";
import { ScoreGamePage } from "../score-game/ScoreGamePage";
import { skullKingMatchesStorageKey, skullKingRounds } from "./config";

type SkullKingPageProps = {
    players: Player[];
};

export function SkullKingPage({ players }: SkullKingPageProps) {
    return (
        <ScoreGamePage
            players={players}
            gameName="Skull King"
            gameCover="/game-covers/skull-king.jpg"
            gameSummary={`La partida dura ${skullKingRounds} rondes i guanya qui més punts acumula. En una aposta encertada sumes 20 punts per presa apostada; si falla, restes 10 punts per presa apostada. Una aposta de zero suma o resta 10 punts per número de ronda. Els bonus es poden afegir o restar manualment amb els controls de cada ronda.`}
            scoreLimit={skullKingRounds}
            storageKey={skullKingMatchesStorageKey}
            gameMode="skull-king"
        />
    );
}
