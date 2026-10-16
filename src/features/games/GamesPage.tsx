import { games } from "../../data/games";
import "./GamesPage.css";

export function GamesPage() {
    return (
        <section className="games-panel" id="jocs" aria-labelledby="games-title">
            <div className="section-heading">
                <h1 id="games-title">Jocs</h1>
            </div>

            <div className="games-grid">
                {games.map((game) => {
                    const cardContent = (
                        <>
                            <div className="game-art">
                                <img className="game-cover" src={game.cover} alt={`Portada de ${game.name}`} />
                            </div>
                            <div className="game-info">
                                <div className="game-meta">
                                    <span>{game.category}</span>
                                    {game.available ? (
                                        <span className="game-ready">Juga ara</span>
                                    ) : (
                                        <span className="coming-soon"><span /> Properament</span>
                                    )}
                                </div>
                                <h2>{game.name}</h2>
                            </div>
                        </>
                    );

                    return game.available ? (
                        <a className="game-card game-card-link" href={`#${game.id}`} key={game.id}>
                            {cardContent}
                        </a>
                    ) : (
                        <article className="game-card" key={game.id}>
                            {cardContent}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
