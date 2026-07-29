import { create } from "zustand";

let nextId = 1;

function generateId() {
  return `win-${nextId++}`;
}

const DEFAULT_SETTINGS = {
  searchEngine: "https://www.google.com/search?q=%s",
  wallpaper: "",
  theme: "dark",
};

const savedSettings = (() => {
  try {
    const s = localStorage.getItem("cognito-settings");
    return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
})();

let nextNotifId = 1;

export const useStore = create((set, get) => ({
  apps: [],
  loadApps: async () => {
    try {
      const res = await fetch("/applist.json");
      const data = await res.json();
      set({ apps: data.apps });
    } catch {
      set({
        apps: [
          { id: "browser", name: "Browser", icon: "\uD83C\uDF10", url: "https://www.google.com", type: "browser", description: "Browse the web freely" },
          { id: "settings", name: "Settings", icon: "\u2699\uFE0F", url: "", type: "internal", description: "System settings" },
        ],
      });
    }
  },

  windows: [],
  activeWindowId: null,
  nextZIndex: 1,

  openWindow: (appId, url) => {
    const { apps, windows, nextZIndex } = get();
    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    if (app.type !== "browser") {
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
      title: app.name,
      icon: app.icon,
      url: url || app.url,
      x: 80 + offset,
      y: 60 + offset,
      width: app.type === "browser" ? 960 : 520,
      height: app.type === "browser" ? 640 : 460,
      minimized: false,
      isMaximized: false,
      savedBounds: null,
      zIndex: nextZIndex,
      type: app.type,
    };

    set({
      windows: [...windows, w],
      activeWindowId: id,
      nextZIndex: nextZIndex + 1,
    });
  },

  closeWindow: (id) => {
    set((s) => ({
      windows: s.windows.filter((w) => w.id !== id),
      activeWindowId: s.activeWindowId === id ? null : s.activeWindowId,
    }));
  },

  focusWindow: (id) => {
    set((s) => {
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
          return { ...w, isMaximized: false, ...(w.savedBounds || {}) };
        }
        return {
          ...w,
          isMaximized: true,
          savedBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      }),
    }));
  },

  updateWindow: (id, patch) => {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    }));
  },

  showNotificationCenter: false,
  showControlCenter: false,
  showAppLauncher: false,
  isBooted: false,

  toggleNotificationCenter: () =>
    set((s) => ({
      showNotificationCenter: !s.showNotificationCenter,
      showControlCenter: false,
    })),

  toggleControlCenter: () =>
    set((s) => ({
      showControlCenter: !s.showControlCenter,
      showNotificationCenter: false,
    })),

  toggleAppLauncher: () =>
    set((s) => ({ showAppLauncher: !s.showAppLauncher })),

  notifications: [
    {
      id: "welcome",
      title: "Welcome to Cognito",
      message: "Your WebOS is ready. Click the globe to browse the web.",
      time: new Date(),
    },
  ],

  addNotification: (n) =>
    set((s) => ({
      notifications: [
        { id: `n-${nextNotifId++}`, time: new Date(), ...n },
        ...s.notifications,
      ].slice(0, 20),
    })),

  removeNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  settings: savedSettings,

  updateSettings: (patch) =>
    set((s) => {
      const next = { ...s.settings, ...patch };
      localStorage.setItem("cognito-settings", JSON.stringify(next));
      return { settings: next };
    }),

  wifiEnabled: true,
  bluetoothEnabled: false,
  doNotDisturb: false,

  toggleWifi: () => set((s) => ({ wifiEnabled: !s.wifiEnabled })),
  toggleBluetooth: () => set((s) => ({ bluetoothEnabled: !s.bluetoothEnabled })),
  toggleDND: () => set((s) => ({ doNotDisturb: !s.doNotDisturb })),

  nowPlaying: null,
  showMusicPlayer: false,

  setNowPlaying: (info) => set({ nowPlaying: info }),
  toggleMusicPlayer: () => set((s) => ({ showMusicPlayer: !s.showMusicPlayer })),

  boot: () => set({ isBooted: true }),
}));
