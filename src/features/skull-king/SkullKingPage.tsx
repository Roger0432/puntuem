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
            gameSummary={`La partida dura ${skullKingRounds} rondes: cada jugador aposta quantes preses guanyarà; al final guanya qui més punts tingui. Encerta l'aposta i suma 20 punts per presa; fallar penalitza 10 punts per presa de diferència (les apostes de zero valen ±10 punts per número de ronda). Amb una aposta encertada, els pirates capturats amb el Skull King donen +30 cadascun (Scary Mary inclosa) i la Sirena que captura el Skull King dona +50.`}
            scoreLimit={skullKingRounds}
            storageKey={skullKingMatchesStorageKey}
            gameMode="skull-king"
        />
    );
}
