export type Game = {
    id: string;
    name: string;
    category: string;
    cover: string;
    available: boolean;
};

export const games: Game[] = [
    {
        id: "skull-king",
        name: "Skull King",
        category: "Cartes · Estratègia",
        cover: "/game-covers/skull-king.jpg",
        available: true,
    },
    {
        id: "skyjo",
        name: "Skyjo",
        category: "Cartes · Familiar",
        cover: "/game-covers/skyjo.jpeg",
        available: true,
    },
    {
        id: "toma-6",
        name: "Toma 6",
        category: "Cartes · Estratègia",
        cover: "/game-covers/toma-6.jpg",
        available: true,
    },
];
