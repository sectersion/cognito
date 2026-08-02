import { useState, useRef, useCallback, useEffect } from "react";
import { search } from "../utils/search";
import {
	readFrameState,
	displayUrl,
	callFrame,
	hideDocumentScrollbar,
	errorMessage,
	timeout,
} from "../utils/browser-helpers";

let tabIdCounter = 1;

export function useTabs({
	win,
	standalone,
	settings,
	updateWindow,
	getController,
	ensureTransport,
}) {
	const [tabs, setTabs] = useState(() => [
		{
			id: `tab-${tabIdCounter++}`,
			url: win.url || settings.homepage || "",
			title: "New Tab",
			history: [],
			historyIndex: -1,
			loading: false,
		},
	]);
	const [activeTabId, setActiveTabId] = useState(tabs[0].id);
	const framesRef = useRef({});
	const containersRef = useRef({});
	const navigationRef = useRef({});
	const activeTabIdRef = useRef(activeTabId);
	activeTabIdRef.current = activeTabId;
	const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
	const [inputValue, setInputValue] = useState(activeTab?.url || "");

	const updateTab = (id, patch) => {
		setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
	};

	const navigate = useCallback(
		async (input, options = {}) => {
			const value = input.trim();
			if (!value) return;
			const targetUrl = search(value, settings.searchProvider);
			const id = activeTabId;
			navigationRef.current[id] =
				options.historyIndex == null
					? { type: "navigate", url: targetUrl }
					: { type: "history", url: targetUrl, index: options.historyIndex };
			updateTab(id, { url: targetUrl, title: "Loading...", loading: true });
			setInputValue(targetUrl);
			try {
				let frame = framesRef.current[id];
				if (!frame) {
					const controller = getController();
					try {
						await Promise.race([ensureTransport(), timeout(8000)]);
						const freshController = getController();
						frame = freshController?.createFrame();
					} catch (error) {
						console.warn(
							"Proxy unavailable, using browser iframe fallback:",
							error
						);
					}
					if (!frame) {
						const iframe = document.createElement("iframe");
						iframe.setAttribute("title", "Web page");
						iframe.setAttribute("referrerpolicy", "no-referrer");
						frame = { frame: iframe, native: true };
					}
					frame.frame.style.cssText =
						"width:100%;height:100%;border:none;background:white;display:block;";
					const container = containersRef.current[id];
					if (container) {
						container.innerHTML = "";
						container.appendChild(frame.frame);
					}
					const onUrlChange = (e) => {
						const controller = getController();
						const state = readFrameState(frame);
						const url = displayUrl(e.url || state.url, controller);
						if (!url) return;
						setInputValue((current) =>
							id === activeTabIdRef.current ? url : current
						);
						setTabs((prev) =>
							prev.map((tab) => {
								if (tab.id !== id) return tab;
								const action = navigationRef.current[id];
								const index =
									action?.type === "history" && action.url === url
										? action.index
										: [...tab.history.slice(0, tab.historyIndex + 1), url]
												.length - 1;
								const history =
									action?.type === "history" && action.url === url
										? tab.history
										: [...tab.history.slice(0, tab.historyIndex + 1), url];
								navigationRef.current[id] = null;
								return {
									...tab,
									url,
									history,
									historyIndex: index,
									loading: false,
									title:
										state.title ||
										(tab.title === "Loading..." ? "" : tab.title),
								};
							})
						);
					};
					const onLoad = () => {
						if (standalone) hideDocumentScrollbar(frame);
						const controller = getController();
						const state = readFrameState(frame);
						const url = displayUrl(state.url, controller);
						let hostname = "New Tab";
						try {
							hostname = url ? new URL(url).hostname : hostname;
						} catch (e) {
							console.warn("Failed to parse URL:", e);
						}
						const title = state.title || hostname;
						setTabs((prev) =>
							prev.map((tab) => {
								if (tab.id !== id) return tab;
								const action = navigationRef.current[id];
								if (action?.type === "history") {
									navigationRef.current[id] = null;
									return {
										...tab,
										url: url || action.url,
										historyIndex: action.index,
										loading: false,
										title,
									};
								}
								if (url && action?.type === "navigate") {
									const history = [
										...tab.history.slice(0, tab.historyIndex + 1),
										url,
									];
									navigationRef.current[id] = null;
									return {
										...tab,
										url,
										history,
										historyIndex: history.length - 1,
										loading: false,
										title,
									};
								}
								return { ...tab, loading: false, title };
							})
						);
						if (id === activeTabIdRef.current) setInputValue(url || targetUrl);
						updateWindow(win.id, {
							title: title === "New Tab" ? "Safari" : title,
						});
					};
					frame.addEventListener?.("urlchange", onUrlChange);
					frame.frame.addEventListener("load", onLoad);
					frame._cleanup = () => {
						frame.removeEventListener?.("urlchange", onUrlChange);
						frame.frame.removeEventListener("load", onLoad);
					};
					framesRef.current[id] = frame;
				}
				if (frame.native) frame.frame.src = targetUrl;
				else frame.go(targetUrl);
			} catch (e) {
				console.error("Navigation error:", e);
				updateTab(id, { loading: false, title: "Unable to load" });
				const container = containersRef.current[id];
				if (container) {
					container.replaceChildren();
					const errorView = document.createElement("div");
					errorView.className = "browser-error";
					const title = document.createElement("strong");
					title.textContent = "Unable to load this page";
					const detail = document.createElement("span");
					detail.textContent = errorMessage(e);
					errorView.append(title, detail);
					container.appendChild(errorView);
					if (framesRef.current[id]) {
						framesRef.current[id]._cleanup?.();
						delete framesRef.current[id];
					}
				}
			}
		},
		[
			settings.searchProvider,
			activeTabId,
			updateWindow,
			win.id,
			getController,
			ensureTransport,
		]
	);

	const moveHistory = (direction) => {
		const tab = tabs.find((item) => item.id === activeTabId);
		const index = (tab?.historyIndex ?? -1) + direction;
		if (!tab || index < 0 || index >= tab.history.length) return;
		const url = tab.history[index];
		navigationRef.current[activeTabId] = { type: "history", url, index };
		updateTab(activeTabId, { loading: true, title: "Loading..." });
		if (
			!callFrame(
				framesRef.current[activeTabId],
				direction < 0 ? "back" : "forward"
			)
		) {
			navigationRef.current[activeTabId] = null;
			navigate(url, { historyIndex: index });
		}
	};

	const reload = () => {
		const frame = framesRef.current[activeTabId];
		if (!frame) {
			if (activeTab?.url) navigate(activeTab.url);
			return;
		}
		updateTab(activeTabId, { loading: true });
		if (!callFrame(frame, "reload")) {
			try {
				frame.frame.contentWindow.location.reload();
			} catch {
				navigate(activeTab.url);
			}
		}
	};

	const stop = () => {
		try {
			framesRef.current[activeTabId]?.frame?.contentWindow?.stop();
		} catch (e) {
			console.warn("Failed to stop navigation:", e);
		}
		navigationRef.current[activeTabId] = null;
		updateTab(activeTabId, { loading: false });
	};

	const switchTab = (id) => {
		setActiveTabId(id);
		const tab = tabs.find((t) => t.id === id);
		if (tab) setInputValue(tab.url);
	};

	const addTab = () => {
		const id = `tab-${tabIdCounter++}`;
		setTabs((prev) => [
			...prev,
			{
				id,
				url: settings.homepage || "",
				title: "New Tab",
				history: [],
				historyIndex: -1,
				loading: false,
			},
		]);
		setActiveTabId(id);
		setInputValue("");
	};

	const closeTab = (id) => {
		if (tabs.length <= 1) return;
		framesRef.current[id]?._cleanup?.();
		delete framesRef.current[id];
		const container = containersRef.current[id];
		if (container) container.innerHTML = "";
		setTabs((prev) => {
			const next = prev.filter((t) => t.id !== id);
			if (activeTabId === id) {
				const idx = prev.findIndex((t) => t.id === id);
				const newActive = next[Math.min(idx, next.length - 1)];
				setInputValue(newActive.url);
				setActiveTabId(newActive.id);
			}
			return next;
		});
	};

	const cleanup = () => {
		Object.values(framesRef.current).forEach((frame) => frame?._cleanup?.());
	};

	useEffect(() => {
		const syncFrameState = () => {
			const frame = framesRef.current[activeTabId];
			const controller = getController();
			const state = readFrameState(frame);
			if (!state.url && !state.title) return;
			const url = displayUrl(state.url, controller);
			let title = state.title;
			try {
				title ||= new URL(url).hostname;
			} catch (e) {
				console.warn("Failed to parse URL:", e);
			}
			updateTab(activeTabId, {
				url: url || activeTab?.url,
				title,
				loading: false,
			});
			if (url && (inputValue === activeTab?.url || !inputValue)) {
				setInputValue(url);
			}
			updateWindow(win.id, { title: title || "Safari" });
		};
		const interval = window.setInterval(syncFrameState, 800);
		return () => window.clearInterval(interval);
	}, [
		activeTabId,
		activeTab?.url,
		inputValue,
		updateWindow,
		win.id,
		getController,
	]);

	return {
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
	};
}
