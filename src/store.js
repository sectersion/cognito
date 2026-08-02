import { create } from "zustand";
import { DEFAULT_APPS } from "./data/appTemplate";

let nextId = 1;

function generateId() {
	return `win-${nextId++}`;
}

export const DEFAULT_SETTINGS = {
	searchProvider: "duckduckgo",
	homepage: "https://www.google.com",
	wallpaper: "",
	accentColor: "#007aff",
	reduceTransparency: false,
	reduceMotion: false,
	dockAutoHide: false,
	dockMagnification: "standard",
	launcherStyle: "grid",
	notificationsEnabled: true,
	doNotDisturb: false,
	aboutBlankCloaking: false,
	blobUrlCloaking: false,
};

const PINNED_APPS_KEY = "cognito-pinned-apps";

function readPinnedApps() {
	try {
		const raw = localStorage.getItem(PINNED_APPS_KEY);
		const value = raw ? JSON.parse(raw) : null;
		return Array.isArray(value)
			? value.filter((id) => typeof id === "string")
			: null;
	} catch (e) {
		console.warn("Failed to read pinned apps:", e);
		return null;
	}
}

function savePinnedApps(ids) {
	try {
		localStorage.setItem(PINNED_APPS_KEY, JSON.stringify(ids));
	} catch (e) {
		console.warn("Failed to save pinned apps:", e);
	}
}

const savedSettings = (() => {
	try {
		const s = localStorage.getItem("cognito-settings");
		if (!s) return DEFAULT_SETTINGS;
		const saved = JSON.parse(s);
		if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
			return DEFAULT_SETTINGS;
		}
		const legacySearchEngine =
			typeof saved.searchEngine === "string" ? saved.searchEngine : "";
		const searchProvider =
			saved.searchProvider ||
			(legacySearchEngine?.includes("duckduckgo")
				? "duckduckgo"
				: legacySearchEngine?.includes("bing")
					? "bing"
					: legacySearchEngine?.includes("yahoo")
						? "yahoo"
						: legacySearchEngine?.includes("google")
							? "google"
							: DEFAULT_SETTINGS.searchProvider);
		const rest = { ...saved };
		delete rest.theme;
		delete rest.searchEngine;
		return { ...DEFAULT_SETTINGS, ...rest, searchProvider };
	} catch (e) {
		console.warn("Failed to load settings, using defaults:", e);
		return DEFAULT_SETTINGS;
	}
})();

let nextNotifId = 1;

export const useStore = create((set, get) => ({
	apps: [],
	pinnedAppIds: readPinnedApps() || ["browser"],
	loadApps: async () => {
		try {
			const res = await fetch("/applist.json");
			if (!res.ok) throw new Error(`App list request failed: ${res.status}`);
			const data = await res.json();
			const apps = Array.isArray(data.apps)
				? data.apps.filter(
						(app) =>
							app &&
							typeof app.id === "string" &&
							typeof app.name === "string" &&
							typeof app.iconName === "string"
					)
				: [];
			const validApps = apps.length ? apps : DEFAULT_APPS;
			const validIds = new Set(validApps.map((app) => app.id));
			const saved = readPinnedApps();
			set({
				apps: validApps,
				pinnedAppIds: (saved || ["browser"]).filter((id) => validIds.has(id)),
			});
		} catch {
			const validIds = new Set(DEFAULT_APPS.map((app) => app.id));
			const saved = readPinnedApps();
			set({
				apps: DEFAULT_APPS,
				pinnedAppIds: (saved || ["browser"]).filter((id) => validIds.has(id)),
			});
		}
	},

	pinApp: (appId) =>
		set((s) => {
			if (
				!s.apps.some((app) => app.id === appId) ||
				s.pinnedAppIds.includes(appId)
			)
				return s;
			const pinnedAppIds = [...s.pinnedAppIds, appId];
			savePinnedApps(pinnedAppIds);
			return { pinnedAppIds };
		}),

	unpinApp: (appId) =>
		set((s) => {
			const pinnedAppIds = s.pinnedAppIds.filter((id) => id !== appId);
			if (pinnedAppIds.length === s.pinnedAppIds.length) return s;
			savePinnedApps(pinnedAppIds);
			return { pinnedAppIds };
		}),

	windows: [],
	activeWindowId: null,
	nextZIndex: 1,

	openWindow: (appId, url, options = {}) => {
		const { apps, windows, nextZIndex } = get();
		const app = apps.find((a) => a.id === appId);
		if (!app) return;

		if (app.type !== "browser" && options.type !== "game") {
			const existing = windows.find((w) => w.appId === appId);
			if (existing) {
				get().focusWindow(existing.id);
				return;
			}
		}

		const id = generateId();
		const offset = (windows.length % 10) * 28;
		const w = {
			id,
			appId,
			title: options.title || app.name,
			iconName: options.iconName || app.iconName,
			url: options.url || url || app.url,
			gameId: options.gameId,
			gameUrl: options.gameUrl,
			x: 80 + offset,
			y: 60 + offset,
			width:
				options.type === "game" ? 1100 : app.type === "browser" ? 960 : 520,
			height:
				options.type === "game" ? 700 : app.type === "browser" ? 640 : 460,
			minimized: false,
			isMaximized: false,
			isSnapped: false,
			savedBounds: null,
			zIndex: nextZIndex,
			type: options.type || app.type,
		};

		set({
			windows: [...windows, w],
			activeWindowId: id,
			nextZIndex: nextZIndex + 1,
		});
	},

	closeWindow: (id) => {
		set((s) => {
			const windows = s.windows.filter((w) => w.id !== id);
			if (windows.length === s.windows.length) return s;
			const nextActive =
				s.activeWindowId === id
					? windows
							.filter((window) => !window.minimized)
							.sort((a, b) => b.zIndex - a.zIndex)[0]?.id || null
					: s.activeWindowId;
			return { windows, activeWindowId: nextActive };
		});
	},

	focusWindow: (id) => {
		set((s) => {
			if (!s.windows.some((w) => w.id === id)) return s;
			const nz = s.nextZIndex;
			return {
				windows: s.windows.map((w) => (w.id === id ? { ...w, zIndex: nz } : w)),
				activeWindowId: id,
				nextZIndex: nz + 1,
			};
		});
	},

	minimizeWindow: (id) => {
		set((s) => ({
			windows: s.windows.map((w) =>
				w.id === id ? { ...w, minimized: !w.minimized } : w
			),
			activeWindowId: s.activeWindowId === id ? null : s.activeWindowId,
		}));
	},

	maximizeWindow: (id) => {
		set((s) => ({
			windows: s.windows.map((w) => {
				if (w.id !== id) return w;
				if (w.isMaximized) {
					return {
						...w,
						isMaximized: false,
						savedBounds: null,
						...(w.savedBounds || {}),
					};
				}
				const bounds = w.savedBounds || {
					x: w.x,
					y: w.y,
					width: w.width,
					height: w.height,
				};
				return {
					...w,
					isMaximized: true,
					savedBounds: bounds,
					isSnapped: false,
					x: 0,
					y: 0,
					width: window.innerWidth,
					height: window.innerHeight,
				};
			}),
		}));
	},

	snapWindow: (id, side) =>
		set((s) => ({
			windows: s.windows.map((w) => {
				if (w.id !== id || w.isMaximized) return w;
				return {
					...w,
					isSnapped: true,
					savedBounds: w.isSnapped
						? w.savedBounds
						: { x: w.x, y: w.y, width: w.width, height: w.height },
					x: side === "left" ? 0 : window.innerWidth / 2,
					y: 0,
					width: window.innerWidth / 2,
					height: window.innerHeight - 28,
				};
			}),
		})),

	restoreWindow: (id) =>
		set((s) => ({
			windows: s.windows.map((w) =>
				w.id === id
					? {
							...w,
							isMaximized: false,
							isSnapped: false,
							savedBounds: null,
							...(w.savedBounds || {}),
						}
					: w
			),
		})),

	updateWindow: (id, patch) => {
		set((s) => ({
			windows: s.windows.map((w) => (w.id === id ? { ...w, ...patch } : w)),
		}));
	},

	showNotificationCenter: false,
	showAppLauncher: false,
	showWindowOverview: false,
	isBooted: false,

	toggleNotificationCenter: () =>
		set((s) => ({ showNotificationCenter: !s.showNotificationCenter })),

	toggleAppLauncher: () =>
		set((s) => ({ showAppLauncher: !s.showAppLauncher })),

	toggleWindowOverview: () =>
		set((s) => ({ showWindowOverview: !s.showWindowOverview })),
	closeWindowOverview: () => set({ showWindowOverview: false }),

	notifications: [
		{
			id: "welcome",
			title: "Welcome to Cognito",
			message: "Your WebOS is ready. Click the globe to browse the web.",
			time: new Date(),
		},
	],

	addNotification: (n) =>
		set((s) => {
			if (!s.settings.notificationsEnabled || s.doNotDisturb) return s;
			return {
				notifications: [
					{ id: `n-${nextNotifId++}`, time: new Date(), ...n },
					...s.notifications,
				].slice(0, 20),
			};
		}),

	removeNotification: (id) =>
		set((s) => ({
			notifications: s.notifications.filter((n) => n.id !== id),
		})),

	settings: savedSettings,

	updateSettings: (patch) =>
		set((s) => {
			const next = { ...s.settings, ...patch };
			try {
				localStorage.setItem("cognito-settings", JSON.stringify(next));
			} catch (e) {
				console.warn("Failed to persist settings:", e);
			}
			return { settings: next, doNotDisturb: next.doNotDisturb };
		}),

	resetSettings: () => {
		const settings = { ...DEFAULT_SETTINGS };
		try {
			localStorage.setItem("cognito-settings", JSON.stringify(settings));
		} catch (e) {
			console.warn("Failed to reset settings:", e);
		}
		set({ settings, doNotDisturb: settings.doNotDisturb });
	},

	scramjetStatus: "unknown",
	setScramjetStatus: (scramjetStatus) => set({ scramjetStatus }),

	doNotDisturb: savedSettings.doNotDisturb,

	toggleDND: () =>
		set((s) => {
			const doNotDisturb = !s.doNotDisturb;
			const settings = { ...s.settings, doNotDisturb };
			try {
				localStorage.setItem("cognito-settings", JSON.stringify(settings));
			} catch (e) {
				console.warn("Failed to persist DND setting:", e);
			}
			return { doNotDisturb, settings };
		}),

	clearBrowsingData: async () => {
		try {
			Object.keys(localStorage).forEach((key) => {
				if (!key.startsWith("cognito-")) localStorage.removeItem(key);
			});
			if (typeof caches !== "undefined") {
				const cacheNames = await caches.keys();
				await Promise.all(cacheNames.map((name) => caches.delete(name)));
			}
			if (typeof indexedDB !== "undefined" && indexedDB.databases) {
				const databases = await indexedDB.databases();
				await Promise.all(
					databases
						.filter((db) => db.name)
						.map(
							(db) =>
								new Promise((resolve) => {
									const request = indexedDB.deleteDatabase(db.name);
									request.onsuccess =
										request.onerror =
										request.onblocked =
											resolve;
								})
						)
				);
			}
		} catch (e) {
			console.error("Failed to clear browsing data:", e);
		}
	},

	nowPlaying: null,
	showMusicPlayer: false,

	setNowPlaying: (info) =>
		set((s) => {
			const previous = s.nowPlaying;
			if (
				previous === info ||
				(previous &&
					info &&
					previous.title === info.title &&
					previous.playing === info.playing &&
					previous.currentTime === info.currentTime &&
					previous.duration === info.duration)
			)
				return s;
			return { nowPlaying: info };
		}),
	toggleMusicPlayer: () =>
		set((s) => ({ showMusicPlayer: !s.showMusicPlayer })),

	boot: () => set({ isBooted: true }),
}));
