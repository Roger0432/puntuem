import type { Player } from "../../types/player";
import "./RankingPage.css";

type RankingPageProps = {
    players: Player[];
    wins: Record<string, number>;
};

export function RankingPage({ players, wins }: RankingPageProps) {
    const rankedPlayers = [...players].sort(
        (first, second) =>
            (wins[second.id] ?? 0) - (wins[first.id] ?? 0) ||
            first.name.localeCompare(second.name, "ca"),
    );
    const podiumPlayers = rankedPlayers.slice(0, 3);
    const remainingPlayers = rankedPlayers.slice(3);

    return (
        <section className="ranking-page" id="ranking" aria-labelledby="ranking-title">
            <div className="section-heading ranking-heading">
                <h1 id="ranking-title">Rànquing global</h1>
                <span className="trophy-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
                        <path d="M8 6H5v2a4 4 0 0 0 4 4m7-6h3v2a4 4 0 0 1-4 4m-3 0v4m-3 3h6m-5-3h4" />
                    </svg>
                </span>
            </div>
            <div className="ranking-column-heading"><span>Partides guanyades</span></div>
            {rankedPlayers.length === 0 ? (
                <div className="ranking-empty">
                    <span className="empty-cup" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
                            <path d="M8 6H5v2a4 4 0 0 0 4 4m7-6h3v2a4 4 0 0 1-4 4m-3 0v4m-3 3h6m-5-3h4" />
                        </svg>
                    </span>
                    <p>Encara no hi ha jugadors</p>
                </div>
            ) : (
                <>
                    <ol className="ranking-podium" aria-label="Top 3 del rànquing">
                        {[podiumPlayers[1], podiumPlayers[0], podiumPlayers[2]]
                            .filter((player): player is Player => player !== undefined)
                            .map((player) => {
                                const position = podiumPlayers.indexOf(player) + 1;
                                return (
                                    <li className={`podium-card podium-place-${position}`} key={player.id}>
                                        <span className="podium-place">{position}</span>
                                        <span className="podium-avatar"><img src={player.avatar} alt="" /></span>
                                        <span className="podium-player-name">{player.name}</span>
                                        <strong className="podium-wins">{wins[player.id] ?? 0}</strong>
                                    </li>
                                );
                            })}
                    </ol>
                    {remainingPlayers.length > 0 && (
                        <ol className="ranking-list" start={4} aria-label="Resta del rànquing">
                            {remainingPlayers.map((player, index) => (
                                <li className="ranking-row" key={player.id}>
                                    <span className="ranking-position">{index + 4}</span>
                                    <span className="player-avatar"><img src={player.avatar} alt="" /></span>
                                    <span className="ranked-player-name">{player.name}</span>
                                    <strong className="player-wins">{wins[player.id] ?? 0}</strong>
                                </li>
                            ))}
                        </ol>
                    )}
                </>
            )}
        </section>
    );
}
