import express from "express";
import https from "https";

const router = express.Router();

const fallbackGames = [
  {
    id: "540",
    title: "Overwatch 2",
    thumbnail: "https://www.freetogame.com/g/540/thumbnail.jpg",
    short_description: "Hero shooter em equipes com modos objetivos e elenco variado.",
    game_url: "https://www.freetogame.com/open/overwatch-2",
    genre: "Shooter",
    platform: "PC (Windows)",
    publisher: "Activision Blizzard",
    developer: "Blizzard Entertainment",
    release_date: "2022-10-04",
  },
  {
    id: "521",
    title: "Diablo Immortal",
    thumbnail: "https://www.freetogame.com/g/521/thumbnail.jpg",
    short_description: "RPG de acao com masmorras, loot e progressao constante.",
    game_url: "https://www.freetogame.com/open/diablo-immortal",
    genre: "MMOARPG",
    platform: "PC (Windows)",
    publisher: "Blizzard Entertainment",
    developer: "Blizzard Entertainment",
    release_date: "2022-06-02",
  },
  {
    id: "517",
    title: "Lost Ark",
    thumbnail: "https://www.freetogame.com/g/517/thumbnail.jpg",
    short_description: "MMOARPG com combate isometrico, raids e exploracao naval.",
    game_url: "https://www.freetogame.com/open/lost-ark",
    genre: "ARPG",
    platform: "PC (Windows)",
    publisher: "Amazon Games",
    developer: "Smilegate RPG",
    release_date: "2022-02-11",
  },
  {
    id: "475",
    title: "Genshin Impact",
    thumbnail: "https://www.freetogame.com/g/475/thumbnail.jpg",
    short_description: "RPG de mundo aberto com exploracao, personagens e combate elemental.",
    game_url: "https://www.freetogame.com/open/genshin-impact",
    genre: "Action RPG",
    platform: "PC (Windows)",
    publisher: "miHoYo",
    developer: "miHoYo",
    release_date: "2020-09-28",
  },
  {
    id: "452",
    title: "Call Of Duty: Warzone",
    thumbnail: "https://www.freetogame.com/g/452/thumbnail.jpg",
    short_description: "Battle royale de grande escala com ritmo rapido e arsenal moderno.",
    game_url: "https://www.freetogame.com/open/call-of-duty-warzone",
    genre: "Shooter",
    platform: "PC (Windows)",
    publisher: "Activision",
    developer: "Infinity Ward",
    release_date: "2020-03-10",
  },
  {
    id: "365",
    title: "Dauntless",
    thumbnail: "https://www.freetogame.com/g/365/thumbnail.jpg",
    short_description: "Caca cooperativa a monstros com equipamentos craftaveis.",
    game_url: "https://www.freetogame.com/open/dauntless",
    genre: "MMORPG",
    platform: "PC (Windows)",
    publisher: "Phoenix Labs",
    developer: "Phoenix Labs",
    release_date: "2019-05-21",
  },
];

function fetchFreeToGameCatalog() {
  return new Promise((resolve, reject) => {
    const request = https.get("https://www.freetogame.com/api/games", (response) => {
      let body = "";

      response.on("data", (chunk) => {
        body += chunk;
      });

      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`FreeToGame respondeu com status ${response.statusCode}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    request.setTimeout(5000, () => {
      request.destroy(new Error("Tempo limite ao buscar catalogo"));
    });

    request.on("error", reject);
  });
}

router.get("/", async (req, res) => {
  try {
    const games = await fetchFreeToGameCatalog();
    res.json({ games: games.slice(0, 120), source: "freetogame" });
  } catch (error) {
    console.warn("Usando catalogo local:", error.message);
    res.json({ games: fallbackGames, source: "local" });
  }
});

export default router;
