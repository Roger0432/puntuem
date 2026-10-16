import type { Player } from "../../types/player";
import { ScoreGamePage } from "../score-game/ScoreGamePage";
import { skyjoMatchesStorageKey } from "../score-game/storage";

type SkyjoPageProps = {
    players: Player[];
};

export function SkyjoPage({ players }: SkyjoPageProps) {
    return (
        <ScoreGamePage
            players={players}
            gameName="Skyjo"
            gameCover="/game-covers/skyjo.jpeg"
            gameSummary="Descarta cartes i intenta acabar cada ronda amb la puntuació més baixa. La partida s'acaba quan algú arriba als 100 punts; guanya qui n'ha acumulat menys."
            scoreLimit={100}
            storageKey={skyjoMatchesStorageKey}
        />
    );
}
