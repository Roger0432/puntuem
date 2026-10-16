import type { Player } from "../types/player";
import "./AvatarLightbox.css";

type AvatarLightboxProps = {
    player: Player;
    onClose: () => void;
};

export function AvatarLightbox({ player, onClose }: AvatarLightboxProps) {
    return (
        <div
            className="avatar-lightbox"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                className="avatar-lightbox-content"
                role="dialog"
                aria-modal="true"
                aria-label={`Foto de ${player.name}`}
            >
                <button className="lightbox-close" type="button" onClick={onClose} aria-label="Tanca la foto">
                    ×
                </button>
                <img src={player.avatar} alt={`Foto de perfil de ${player.name}`} />
                <h2>{player.name}</h2>
            </section>
        </div>
    );
}
