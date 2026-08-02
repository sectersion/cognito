import { useStore } from "../store";
import AppIcon from "./AppIcon";

export default function WindowOverview() {
	const allWindows = useStore((s) => s.windows);
	const windows = allWindows.filter((win) => !win.minimized);
	const focusWindow = useStore((s) => s.focusWindow);
	const closeWindowOverview = useStore((s) => s.closeWindowOverview);

	return (
		<div className="window-overview" onClick={closeWindowOverview}>
			<div className="window-overview-heading">
				<span className="window-overview-kicker">Workspace</span>
				<h1>Window Overview</h1>
				<p>Choose a window to return to it</p>
			</div>
			<div
				className="window-overview-grid"
				onClick={(event) => event.stopPropagation()}
			>
				{windows.length === 0 ? (
					<div className="window-overview-empty">No open windows</div>
				) : (
					windows.map((win) => (
						<button
							type="button"
							className="window-overview-card"
							key={win.id}
							onClick={() => {
								focusWindow(win.id);
								closeWindowOverview();
							}}
						>
							<div className="window-overview-preview">
								<div className="window-overview-preview-bar">
									<i />
									<i />
									<i />
								</div>
								<div
									className={`window-overview-preview-body overview-${win.type}`}
								>
									<AppIcon name={win.iconName} size={42} />
									<strong>{win.title}</strong>
								</div>
							</div>
							<span>{win.title}</span>
						</button>
					))
				)}
			</div>
			<kbd>F3</kbd>
		</div>
	);
}
