import type { Player } from "../../types/player";
import { ScoreGamePage } from "../score-game/ScoreGamePage";
import { toma6MatchesStorageKey, toma6ScoreLimit } from "./config";

type Toma6PageProps = {
    players: Player[];
};

export function Toma6Page({ players }: Toma6PageProps) {
    return (
        <ScoreGamePage
            players={players}
            gameName="Toma 6"
            gameCover="/game-covers/toma-6.jpg"
            gameSummary="Juga cartes en ordre creixent i evita recollir files amb caps de bou, que sumen punts de penalització. La partida s'acaba quan algú arriba als 66 punts; guanya qui n'ha acumulat menys."
            scoreLimit={toma6ScoreLimit}
            storageKey={toma6MatchesStorageKey}
        />
    );
}
