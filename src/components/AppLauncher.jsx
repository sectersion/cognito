import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../store";
import { AppTile } from "./AppIcon";
import ContextMenu, { useContextMenu } from "./ContextMenu";

export default function AppLauncher() {
	const apps = useStore((s) => s.apps);
	const openWindow = useStore((s) => s.openWindow);
	const toggleAppLauncher = useStore((s) => s.toggleAppLauncher);
	const pinnedAppIds = useStore((s) => s.pinnedAppIds);
	const pinApp = useStore((s) => s.pinApp);
	const unpinApp = useStore((s) => s.unpinApp);
	const launcherStyle = useStore((s) => s.settings.launcherStyle);
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("All Apps");
	const panelRef = useRef(null);
	const { menu, openMenu, closeMenu } = useContextMenu();

	useEffect(() => {
		panelRef.current?.querySelector("input")?.focus();
	}, []);

	const categories = useMemo(
		() => ["All Apps", ...new Set(apps.map((app) => app.category || "Web"))],
		[apps]
	);
	const filtered = apps.filter((app) => {
		const text =
			`${app.name} ${app.description || ""} ${(app.keywords || []).join(" ")}`.toLowerCase();
		return (
			(category === "All Apps" || (app.category || "Web") === category) &&
			(!query || text.includes(query.toLowerCase()))
		);
	});

	return (
		<div
			className="launcher-backdrop"
			role="presentation"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) toggleAppLauncher();
			}}
		>
			<section
				ref={panelRef}
				className={`launcher-panel launcher-${launcherStyle}`}
				role="dialog"
				aria-label="App Launcher"
				aria-modal="true"
			>
				<div className="launcher-heading">
					<div>
						<span className="launcher-eyebrow">Cognito</span>
						<h1>Applications</h1>
					</div>
					<span className="launcher-count">{apps.length} apps</span>
				</div>
				<label className="launcher-search">
					<span aria-hidden="true">⌕</span>
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search applications"
						aria-label="Search applications"
					/>
					<kbd>ESC</kbd>
				</label>
				<div className="launcher-body">
					<nav className="launcher-sidebar" aria-label="Application categories">
						{categories.map((item) => (
							<button
								key={item}
								type="button"
								className={category === item ? "active" : ""}
								onClick={() => setCategory(item)}
							>
								{item}
							</button>
						))}
					</nav>
					<div className="launcher-apps" role="list">
						{filtered.length ? (
							filtered.map((app) => {
								const isPinned = pinnedAppIds.includes(app.id);
								return (
									<button
										key={app.id}
										type="button"
										role="listitem"
										className="launcher-app"
										aria-label={`Open ${app.name}`}
										onClick={() => {
											openWindow(app.id);
											toggleAppLauncher();
										}}
										onContextMenu={(event) =>
											openMenu(event, {
												items: [
													{
														label: isPinned
															? "Remove from Dock"
															: "Add to Dock",
														onSelect: () =>
															isPinned ? unpinApp(app.id) : pinApp(app.id),
													},
													{ separator: true },
													{ label: "Open", onSelect: () => openWindow(app.id) },
												],
											})
										}
									>
										<AppTile name={app.iconName} size={46} label={app.name} />
										<span>{app.name}</span>
										{isPinned && (
											<i aria-label="Pinned" title="Pinned">
												•
											</i>
										)}
									</button>
								);
							})
						) : (
							<p className="launcher-empty">No applications found</p>
						)}
					</div>
				</div>
			</section>
			{menu && <ContextMenu {...menu} onClose={closeMenu} />}
		</div>
	);
}
