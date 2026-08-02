import { useMemo, useState } from "react";
import { useStore } from "../store";
import { AppTile } from "./AppIcon";
import { GAME_CATALOG } from "../data/gameCatalog";

export default function GameLibrary() {
	const openWindow = useStore((s) => s.openWindow);
	const [query, setQuery] = useState("");
	const [selectedId, setSelectedId] = useState(GAME_CATALOG[0].id);
	const [genre, setGenre] = useState("All Games");
	const genres = ["All Games", "Action", "Arcade", "Puzzle", "Adventure"];
	const filtered = useMemo(
		() =>
			GAME_CATALOG.filter((game) => {
				const matchesGenre = genre === "All Games" || game.genre === genre;
				return (
					matchesGenre && game.name.toLowerCase().includes(query.toLowerCase())
				);
			}),
		[genre, query]
	);
	const selected =
		GAME_CATALOG.find((game) => game.id === selectedId) ||
		filtered[0] ||
		GAME_CATALOG[0];

	const launch = (game, event) => {
		event?.stopPropagation();
		openWindow("steam", undefined, {
			type: "game",
			gameId: game.id,
			gameUrl: game.url,
			title: game.name,
			iconName: "game-library",
		});
	};

	return (
		<div className="steam-library">
			<aside className="steam-sidebar">
				<div className="steam-brand">
					<AppTile name="game-library" size={30} />
					<strong>Steam</strong>
				</div>
				<label className="steam-search">
					<span>⌕</span>
					<input
						aria-label="Search games"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search"
					/>
				</label>
				<div className="steam-sidebar-label">Library</div>
				{genres.map((item) => (
					<button
						key={item}
						type="button"
						className={genre === item ? "active" : ""}
						onClick={() => setGenre(item)}
					>
						{item}
					</button>
				))}
				<div className="steam-sidebar-footer">
					{GAME_CATALOG.length} games available
				</div>
			</aside>
			<main className="steam-main">
				<section className="steam-hero">
					<div className="steam-hero-art">
						{selected.art ? (
							<img src={selected.art} alt="" />
						) : (
							<span>{selected.name.slice(0, 1)}</span>
						)}
						<small>{selected.genre.toUpperCase()}</small>
					</div>
					<div className="steam-hero-copy">
						<span className="steam-kicker">IN YOUR LIBRARY</span>
						<h1>{selected.name}</h1>
						<p>{selected.description}</p>
						<button
							type="button"
							className="steam-play"
							onClick={(event) => launch(selected, event)}
						>
							▶&nbsp; PLAY
						</button>
					</div>
				</section>
				<div className="steam-section-heading">
					<h2>All Games</h2>
					<span>{filtered.length} results</span>
				</div>
				<div className="steam-game-grid">
					{filtered.length ? (
						filtered.map((game) => (
							<button
								key={game.id}
								type="button"
								className={`steam-game-card${game.id === selected.id ? " selected" : ""}`}
								onClick={() => setSelectedId(game.id)}
								onDoubleClick={(event) => launch(game, event)}
							>
								<div className="steam-card-art">
									{game.art ? (
										<img src={game.art} alt="" />
									) : (
										<span>{game.name.slice(0, 1)}</span>
									)}
								</div>
								<strong>{game.name}</strong>
								<small>{game.genre}</small>
							</button>
						))
					) : (
						<p className="steam-empty" role="status">
							No games match your filters.
							<button
								type="button"
								onClick={() => {
									setQuery("");
									setGenre("All Games");
								}}
							>
								Clear filters
							</button>
						</p>
					)}
				</div>
			</main>
		</div>
	);
}
