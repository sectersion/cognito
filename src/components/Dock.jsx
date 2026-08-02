import { useState, useRef, useEffect } from "react";
import { useStore } from "../store";
import { AppTile } from "./AppIcon";
import ContextMenu, { useContextMenu } from "./ContextMenu";

export default function Dock() {
	const apps = useStore((s) => s.apps);
	const windows = useStore((s) => s.windows);
	const openWindow = useStore((s) => s.openWindow);
	const focusWindow = useStore((s) => s.focusWindow);
	const toggleAppLauncher = useStore((s) => s.toggleAppLauncher);
	const pinnedAppIds = useStore((s) => s.pinnedAppIds);
	const pinApp = useStore((s) => s.pinApp);
	const unpinApp = useStore((s) => s.unpinApp);
	const settings = useStore((s) => s.settings);
	const dockRef = useRef(null);
	const [hoverPos, setHoverPos] = useState(null);
	const [isEdgeRevealed, setIsEdgeRevealed] = useState(!settings.dockAutoHide);
	const { menu, openMenu, closeMenu } = useContextMenu();
	const hasMaximizedWindow = windows.some(
		(win) => win.isMaximized && !win.minimized
	);

	useEffect(() => {
		if (!hasMaximizedWindow && !settings.dockAutoHide) {
			setIsEdgeRevealed(true);
			return undefined;
		}
		setIsEdgeRevealed(false);

		const handlePointerMove = (event) => {
			setIsEdgeRevealed(event.clientY >= window.innerHeight - 24);
		};
		window.addEventListener("mousemove", handlePointerMove);
		return () => window.removeEventListener("mousemove", handlePointerMove);
	}, [hasMaximizedWindow, settings.dockAutoHide]);

	const openAppIds = new Set(windows.map((w) => w.appId));
	const dockApps = [
		...pinnedAppIds
			.map((id) => apps.find((app) => app.id === id))
			.filter(Boolean),
		...apps.filter(
			(app) => !pinnedAppIds.includes(app.id) && openAppIds.has(app.id)
		),
	];
	const maxMagnify =
		settings.dockMagnification === "large"
			? 1.5
			: settings.dockMagnification === "off"
				? 1
				: 1.2;
	const iconSize = 48;
	const magRadius = 120;

	function getScale(index, hoverX) {
		if (hoverX === null) return 1;
		const dock = dockRef.current;
		if (!dock) return 1;
		const rect = dock.getBoundingClientRect();
		const icons = dock.querySelectorAll(".dock-icon");
		let totalDist = 0;
		const distances = [];
		icons.forEach((el, i) => {
			const elRect = el.getBoundingClientRect();
			const cx = elRect.left + elRect.width / 2;
			const d = Math.abs(hoverX - cx);
			distances.push(d);
			if (d > totalDist) totalDist = d;
		});
		const dist = distances[index];
		if (dist > magRadius) return 1;
		const t = 1 - dist / magRadius;
		return 1 + (maxMagnify - 1) * t * t;
	}

	return (
		<div
			className="dock-shell"
			style={{
				position: "fixed",
				bottom: 12,
				left: "50%",
				zIndex: 9997,
				display: "flex",
				alignItems: "center",
				gap: 4,
				padding: "6px 10px",
				borderRadius: "var(--radius-lg)",
				background: "rgba(60, 70, 100, 0.25)",
				backdropFilter: "blur(60px) saturate(1.6)",
				WebkitBackdropFilter: "blur(60px) saturate(1.6)",
				border: "1px solid rgba(255,255,255,0.06)",
				boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
				transform: `translateX(-50%) translateY(${(hasMaximizedWindow || settings.dockAutoHide) && !isEdgeRevealed ? "calc(100% + 12px)" : "0"})`,
				opacity:
					(hasMaximizedWindow || settings.dockAutoHide) && !isEdgeRevealed
						? 0
						: 1,
				pointerEvents:
					(hasMaximizedWindow || settings.dockAutoHide) && !isEdgeRevealed
						? "none"
						: "auto",
				transition: "transform 0.2s ease, opacity 0.2s ease",
			}}
			ref={dockRef}
			onMouseMove={(e) => setHoverPos(e.clientX)}
			onMouseLeave={() => setHoverPos(null)}
		>
			{dockApps.map((app, i) => {
				const isOpen = openAppIds.has(app.id);
				const isPinned = pinnedAppIds.includes(app.id);
				const scale = getScale(i, hoverPos);
				return (
					<button
						key={app.id}
						className="dock-icon"
						type="button"
						onClick={() => {
							if (isOpen) {
								const win = windows.find((w) => w.appId === app.id);
								if (win) focusWindow(win.id);
							} else {
								openWindow(app.id);
							}
						}}
						onContextMenu={(event) =>
							openMenu(event, {
								items: [
									{
										label: isPinned ? "Remove from Dock" : "Add to Dock",
										onSelect: () =>
											isPinned ? unpinApp(app.id) : pinApp(app.id),
									},
									{ separator: true },
									{ label: "Open", onSelect: () => openWindow(app.id) },
								],
							})
						}
						title={app.name}
						aria-label={`${app.name}${isOpen ? " (open)" : ""}`}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							padding: "6px",
							borderRadius: "var(--radius-sm)",
							transition: "transform 0.1s ease-out",
							transform: `scale(${scale})`,
							position: "relative",
							fontFamily: "var(--font)",
						}}
						onMouseEnter={(e) => {
							if (hoverPos === null) return;
							e.currentTarget.style.background = "rgba(255,255,255,0.06)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "none";
						}}
					>
						<AppTile name={app.iconName} size={48} label={app.name} />
						<div
							style={{
								position: "absolute",
								bottom: -2,
								left: "50%",
								transform: "translateX(-50%)",
								width: 4,
								height: 4,
								borderRadius: "50%",
								background: isOpen ? "rgba(255,255,255,0.7)" : "transparent",
								transition: "background 0.2s",
							}}
						/>
					</button>
				);
			})}

			<div
				style={{
					width: 1,
					height: 32,
					background: "rgba(255,255,255,0.08)",
					margin: "0 4px",
				}}
			/>

			<button
				className="dock-icon"
				type="button"
				onClick={toggleAppLauncher}
				onContextMenu={(event) =>
					openMenu(event, {
						items: [
							{ label: "Open App Launcher", onSelect: toggleAppLauncher },
						],
					})
				}
				title="Launchpad"
				aria-label="Open app launcher"
				style={{
					background: "none",
					border: "none",
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "4px 6px",
					borderRadius: "var(--radius-sm)",
					fontSize: 20,
					color: "rgba(255,255,255,0.5)",
					fontFamily: "var(--font)",
				}}
				onMouseEnter={(e) =>
					(e.currentTarget.style.background = "rgba(255,255,255,0.06)")
				}
				onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<rect x="3" y="3" width="7" height="7" />
					<rect x="14" y="3" width="7" height="7" />
					<rect x="3" y="14" width="7" height="7" />
					<rect x="14" y="14" width="7" height="7" />
				</svg>
			</button>
			{menu && <ContextMenu {...menu} onClose={closeMenu} />}
		</div>
	);
}
