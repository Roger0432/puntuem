import { useEffect, useState } from "react";
import { AvatarLightbox } from "./components/AvatarLightbox";
import { AppHeader } from "./components/AppHeader";
import { players } from "./data/players";
import { GamesPage } from "./features/games/GamesPage";
import { PlayersPage } from "./features/players/PlayersPage";
import { RankingPage } from "./features/ranking/RankingPage";
import { getGlobalRanking } from "./features/ranking/model";
import { loadMatches, skyjoMatchesStorageKey } from "./features/score-game/storage";
import { SkyjoPage } from "./features/skyjo/SkyjoPage";
import { SkullKingPage } from "./features/skull-king/SkullKingPage";
import { skullKingMatchesStorageKey } from "./features/skull-king/config";
import { Toma6Page } from "./features/toma6/Toma6Page";
import { toma6MatchesStorageKey } from "./features/toma6/config";
import type { Page } from "./types/page";
import type { Player } from "./types/player";

function pageFromHash(): Page {
    if (window.location.hash === "#ranking") return "ranking";
    if (window.location.hash === "#jugadors") return "players";
    if (window.location.hash === "#skyjo") return "skyjo";
    if (window.location.hash === "#toma-6") return "toma-6";
    if (window.location.hash === "#skull-king") return "skull-king";
    return "games";
}

function App() {
    const [page, setPage] = useState<Page>(pageFromHash);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [matchesState, setMatchesState] = useState(() => ({
        skyjo: loadMatches(skyjoMatchesStorageKey),
        toma6: loadMatches(toma6MatchesStorageKey),
        skullKing: loadMatches(skullKingMatchesStorageKey),
    }));

    useEffect(() => {
        function updatePage() {
            setPage(pageFromHash());
            setMatchesState({
                skyjo: loadMatches(skyjoMatchesStorageKey),
                toma6: loadMatches(toma6MatchesStorageKey),
                skullKing: loadMatches(skullKingMatchesStorageKey),
            });
        }

        window.addEventListener("hashchange", updatePage);
        return () => window.removeEventListener("hashchange", updatePage);
    }, []);

    useEffect(() => {
        if (!selectedPlayer) return;

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setSelectedPlayer(null);
        }

        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [selectedPlayer]);

    useEffect(() => {
        if (page !== "ranking") return;

        function refreshMatches() {
            setMatchesState({
                skyjo: loadMatches(skyjoMatchesStorageKey),
                toma6: loadMatches(toma6MatchesStorageKey),
                skullKing: loadMatches(skullKingMatchesStorageKey),
            });
        }

        window.addEventListener("storage", refreshMatches);
        return () => window.removeEventListener("storage", refreshMatches);
    }, [page]);

    const ranking = getGlobalRanking(
        players,
        matchesState.skyjo.matches,
        matchesState.toma6.matches,
        matchesState.skullKing.matches,
    );

    return (
        <div className="app-shell">
            <AppHeader page={page} />

            <main className="page-content" id="inici">
                {page === "games" && <GamesPage />}
                {page === "skyjo" && <SkyjoPage players={players} />}
                {page === "toma-6" && <Toma6Page players={players} />}
                {page === "skull-king" && <SkullKingPage players={players} />}
                {page === "players" && (
                    <PlayersPage players={players} onViewPhoto={setSelectedPlayer} />
                )}
                {page === "ranking" && (
                    <>
                        {[matchesState.skyjo.error, matchesState.toma6.error, matchesState.skullKing.error]
                            .filter((error): error is string => error !== null)
                            .map((error, index) => <p className="form-message error-message" role="alert" key={index}>{error}</p>)}
                        <RankingPage players={ranking.rankedPlayers} wins={ranking.wins} />
                    </>
                )}
            </main>

            {selectedPlayer && (
                <AvatarLightbox
                    player={selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                />
            )}
        </div>
    );
}

export default App;
