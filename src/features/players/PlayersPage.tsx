import type { Player } from "../../types/player";
import "./PlayersPage.css";

type PlayersPageProps = {
    players: Player[];
    onViewPhoto: (player: Player) => void;
};

export function PlayersPage({ players, onViewPhoto }: PlayersPageProps) {
    const sortedPlayers = [...players].sort((first, second) =>
        first.name.localeCompare(second.name, "ca"),
    );

    return (
        <section className="players-page" id="jugadors" aria-labelledby="players-title">
            <div className="section-heading">
                <h1 id="players-title">Jugadors</h1>
            </div>
            <ul className="players-list">
                {sortedPlayers.map((player) => (
                    <li className="player-management-row" key={player.id}>
                        <button
                            className="profile-avatar"
                            type="button"
                            onClick={() => onViewPhoto(player)}
                            aria-label={`Mostra la foto de ${player.name} ampliada`}
                        >
                            <img src={player.avatar} alt="" />
                        </button>
                        <span className="managed-player-name">{player.name}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
