import { useEffect, useRef } from "react";
import { useStore } from "../store";
import { useScramjet } from "../hooks/useScramjet";
import { useTabs } from "../hooks/useTabs";
import { useMediaDetection } from "../hooks/useMediaDetection";
import AppIcon from "./AppIcon";

export default function Browser({ win, standalone = false }) {
	const settings = useStore((s) => s.settings);
	const setScramjetStatus = useStore((s) => s.setScramjetStatus);
	const setNowPlaying = useStore((s) => s.setNowPlaying);
	const updateWindow = useStore((s) => s.updateWindow);

	const { ready, getController, ensureTransport } =
		useScramjet(setScramjetStatus);

	const {
		tabs,
		activeTabId,
		activeTab,
		inputValue,
		setInputValue,
		navigate,
		moveHistory,
		reload,
		stop,
		switchTab,
		addTab,
		closeTab,
		containersRef,
		cleanup,
	} = useTabs({
		win,
		standalone,
		settings,
		updateWindow,
		getController,
		ensureTransport,
	});

	useMediaDetection({ ready, activeTabId, containersRef, setNowPlaying });

	const initRef = useRef({ navigated: false });

	useEffect(() => {
		if (ready && activeTab?.url && !initRef.current.navigated) {
			initRef.current.navigated = true;
			navigate(activeTab.url);
		}
	}, [ready, activeTab?.url, navigate]);

	useEffect(
		() => () => {
			cleanup();
		},
		[]
	);

	const handleSubmit = (e) => {
		e.preventDefault();
		navigate(inputValue);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			navigate(inputValue);
		}
	};

	return (
		<div className="browser-shell">
			{!standalone && (
				<div className="browser-tabs-bar">
					<div className="browser-tabs-list">
						{tabs.map((tab) => (
							<div
								key={tab.id}
								role="tab"
								tabIndex={tab.id === activeTabId ? 0 : -1}
								aria-selected={tab.id === activeTabId}
								className={`browser-tab${tab.id === activeTabId ? " active" : ""}`}
								onClick={() => switchTab(tab.id)}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										switchTab(tab.id);
									}
								}}
							>
								<span className="browser-tab-title">
									{tab.title === "Loading..." ? (
										<span className="loading">Loading...</span>
									) : (
										tab.title || tab.url || "New Tab"
									)}
								</span>
								{tabs.length > 1 && (
									<button
										type="button"
										aria-label={`Close ${tab.title || "tab"}`}
										className="browser-tab-close"
										onClick={(e) => {
											e.stopPropagation();
											closeTab(tab.id);
										}}
									>
										&times;
									</button>
								)}
							</div>
						))}
					</div>
					<button
						onClick={addTab}
						title="New Tab"
						className="browser-new-tab-btn"
					>
						+
					</button>
				</div>
			)}

			{!standalone && (
				<form onSubmit={handleSubmit} className="browser-url-bar">
					<div className="browser-controls">
						<button
							type="button"
							className="browser-control"
							disabled={!activeTab || activeTab.historyIndex <= 0}
							onClick={(event) => {
								event.preventDefault();
								event.stopPropagation();
								moveHistory(-1);
							}}
							title="Back"
							aria-label="Back"
						>
							<AppIcon name="back" size={15} />
						</button>
						<button
							type="button"
							className="browser-control"
							disabled={
								!activeTab ||
								activeTab.historyIndex < 0 ||
								activeTab.historyIndex >= activeTab.history.length - 1
							}
							onClick={(event) => {
								event.preventDefault();
								event.stopPropagation();
								moveHistory(1);
							}}
							title="Forward"
							aria-label="Forward"
						>
							<AppIcon name="forward" size={15} />
						</button>
						<button
							type="button"
							className="browser-control"
							onClick={(event) => {
								event.preventDefault();
								event.stopPropagation();
								(activeTab?.loading ? stop : reload)();
							}}
							title={activeTab?.loading ? "Stop loading" : "Reload"}
							aria-label={activeTab?.loading ? "Stop loading" : "Reload"}
						>
							<AppIcon
								name={activeTab?.loading ? "close" : "reload"}
								size={14}
							/>
						</button>
					</div>
					<input
						name="urlInput"
						className="browser-url-input"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Search or enter URL..."
					/>
				</form>
			)}

			<div className="browser-content">
				{!ready && (
					<div className="browser-loading-overlay">Initializing proxy...</div>
				)}
				{tabs.map((tab) => (
					<div
						key={tab.id}
						ref={(el) => {
							containersRef.current[tab.id] = el;
						}}
						className="browser-tab-frame"
						style={{
							display: tab.id === activeTabId ? "block" : "none",
						}}
					/>
				))}
			</div>
		</div>
	);
}
