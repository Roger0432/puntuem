import type { Page } from "../types/page";
import "./AppHeader.css";

type AppHeaderProps = {
    page: Page;
};

export function AppHeader({ page }: AppHeaderProps) {
    return (
        <header className="site-header">
            <a className="brand" href="#inici" aria-label="Puntuem, inici">
                <span className="brand-mark" aria-hidden="true">p</span>
                <span>puntuem</span>
            </a>

            <nav className="main-nav" aria-label="Navegació principal">
                <a className={`nav-link ${page === "games" || page === "skyjo" || page === "toma-6" || page === "skull-king" ? "active" : ""}`} href="#jocs" aria-current={page === "games" || page === "skyjo" || page === "toma-6" || page === "skull-king" ? "page" : undefined}>
                    Jocs
                </a>
                <a className={`nav-link ${page === "ranking" ? "active" : ""}`} href="#ranking" aria-current={page === "ranking" ? "page" : undefined}>
                    Rànquing global
                </a>
                <a className={`nav-link ${page === "players" ? "active" : ""}`} href="#jugadors" aria-current={page === "players" ? "page" : undefined}>
                    Jugadors
                </a>
            </nav>
        </header>
    );
}
