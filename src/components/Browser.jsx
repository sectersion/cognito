import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "../store";
import { search } from "../utils/search";
import { registerSW } from "../utils/register-sw";

let scramjetPromise = null;
let scramjetController = null;
let baremuxConnection = null;
let tabIdCounter = 1;

function timeout(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
  );
}

async function clearScramjetDB() {
  try {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      await new Promise((resolve, reject) => {
        const req = indexedDB.deleteDatabase(db.name);
        req.onsuccess = resolve;
        req.onerror = () => reject(req.error);
        req.onblocked = resolve;
      });
    }
  } catch {}
}

async function getScramjet() {
  if (scramjetPromise) return scramjetPromise;
  scramjetPromise = (async () => {
    const { ScramjetController } = window.$scramjetLoadController();
    const controller = new ScramjetController({
      files: {
        wasm: "/scram/scramjet.wasm.wasm",
        all: "/scram/scramjet.all.js",
        sync: "/scram/scramjet.sync.js",
      },
    });
    await controller.init();
    scramjetController = controller;
    baremuxConnection = new window.BareMux.BareMuxConnection(
      "/baremux/worker.js"
    );
    return { controller, connection: baremuxConnection };
  })();
  return scramjetPromise;
}

async function ensureTransport() {
  try {
    await registerSW();
  } catch (e) {
    console.warn("SW registration failed:", e);
  }
  const { connection } = await getScramjet();
  const wispUrl =
    (location.protocol === "https:" ? "wss" : "ws") +
    "://" +
    location.host +
    "/wisp/";
  const transport = await connection.getTransport();
  if (transport !== "/libcurl/index.mjs") {
    await connection.setTransport("/libcurl/index.mjs", [
      { websocket: wispUrl },
    ]);
  }
}

export default function Browser({ win }) {
  const settings = useStore((s) => s.settings);
  const setNowPlaying = useStore((s) => s.setNowPlaying);
  const [ready, setReady] = useState(false);
  const [tabs, setTabs] = useState(() => [
    { id: `tab-${tabIdCounter++}`, url: win.url || "", title: "New Tab" },
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const initRef = useRef({ done: false });
  const framesRef = useRef({});
  const containersRef = useRef({});
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const [inputValue, setInputValue] = useState(activeTab?.url || "");

  useEffect(() => {
    if (initRef.current.done) return;
    initRef.current.done = true;
    (async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await Promise.race([ensureTransport(), timeout(8000)]);
          setReady(true);
          return;
        } catch (e) {
          if (
            e.message?.includes("object store") ||
            e.message?.includes("not found")
          ) {
            console.warn("Scramjet DB issue, clearing and retrying...", e);
            await clearScramjetDB();
            scramjetPromise = null;
            scramjetController = null;
            baremuxConnection = null;
            continue;
          }
          if (e.message?.includes("Timed out")) {
            console.warn("Transport init timed out, showing browser UI anyway");
            setReady(true);
            return;
          }
          console.error("Scramjet init error:", e);
          setReady(true);
          return;
        }
      }
      setReady(true);
    })();
  }, []);

  const updateTab = (id, patch) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const navigate = useCallback(
    async (input) => {
      const targetUrl = search(input, settings.searchEngine);
      const id = activeTabId;
      updateTab(id, { url: targetUrl, title: "Loading..." });
      setInputValue(targetUrl);
      try {
        await Promise.race([ensureTransport(), timeout(8000)]);
        let frame = framesRef.current[id];
        if (!frame) {
          frame = scramjetController.createFrame();
          frame.frame.style.cssText =
            "width:100%;height:100%;border:none;background:white;display:block;";
          const container = containersRef.current[id];
          if (container) {
            container.innerHTML = "";
            container.appendChild(frame.frame);
          }
          const onUrlChange = (e) => {
            setInputValue(e.url);
            updateTab(id, { url: e.url });
          };
          frame.addEventListener("urlchange", onUrlChange);
          frame._cleanup = () => frame.removeEventListener("urlchange", onUrlChange);
          framesRef.current[id] = frame;
          frame._pendingNav = null;
        }
        frame._pendingNav = targetUrl;
        frame.go(targetUrl);
      } catch (e) {
        console.error("Navigation error:", e);
        const container = containersRef.current[id];
        if (container) {
          container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.5);font-size:14px;">Failed to load: ${e.message}</div>`;
          if (framesRef.current[id]) {
            framesRef.current[id]._cleanup?.();
            delete framesRef.current[id];
          }
        }
      }
    },
    [settings.searchEngine, activeTabId]
  );

  useEffect(() => {
    if (ready && win.url && !initRef.current.navigated) {
      initRef.current.navigated = true;
      navigate(win.url);
    }
  }, [ready, win.url, navigate]);

  const audioCheckRef = useRef(null);
  const lastMedia = useRef(null);

  useEffect(() => {
    if (!ready) return;
    audioCheckRef.current = setInterval(() => {
      try {
        const container = containersRef.current[activeTabId];
        const iframe = container?.querySelector("iframe");
        const doc = iframe?.contentWindow?.document;
        if (!doc) { setNowPlaying(null); lastMedia.current = null; return; }
        const allMedia = [...doc.querySelectorAll("audio,video")].filter(
          (el) => el.readyState > 0 && !el.ended
        );
        if (allMedia.length === 0) { setNowPlaying(null); lastMedia.current = null; return; }
        const active = allMedia.find((el) => !el.paused && !el.muted && el.volume > 0) || allMedia[0];
        lastMedia.current = active;
        const title = doc.title || active.getAttribute("title") || "Now Playing";
        setNowPlaying({ title, playing: !active.paused, currentTime: active.currentTime, duration: active.duration });
      } catch { setNowPlaying(null); lastMedia.current = null; }
    }, 500);
    return () => { clearInterval(audioCheckRef.current); audioCheckRef.current = null; };
  }, [ready, setNowPlaying, activeTabId]);

  const switchTab = (id) => {
    setActiveTabId(id);
    const tab = tabs.find((t) => t.id === id);
    if (tab) setInputValue(tab.url);
  };

  const addTab = () => {
    const id = `tab-${tabIdCounter++}`;
    setTabs((prev) => [...prev, { id, url: "", title: "New Tab" }]);
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          padding: "4px 4px 0",
          background: "rgba(0,0,0,0.15)",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", flex: 1, gap: 2, overflow: "hidden" }}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 8px",
                cursor: "pointer",
                borderRadius: "6px 6px 0 0",
                background: tab.id === activeTabId ? "rgba(0,0,0,0.25)" : "transparent",
                borderBottom: tab.id === activeTabId ? "2px solid var(--accent)" : "2px solid transparent",
                minWidth: 0,
                flex: "0 1 160px",
                transition: "background 0.15s",
                fontFamily: "var(--font)",
                fontSize: 11,
                color: tab.id === activeTabId ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)",
              }}
              onMouseEnter={(e) => {
                if (tab.id !== activeTabId)
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (tab.id !== activeTabId)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {tab.title === "Loading..." ? (
                  <span style={{ fontStyle: "italic", opacity: 0.5 }}>Loading...</span>
                ) : (
                  tab.title || tab.url || "New Tab"
                )}
              </span>
              {tabs.length > 1 && (
                <span
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                  style={{
                    fontSize: 12,
                    lineHeight: 1,
                    opacity: 0.3,
                    padding: "0 2px",
                    borderRadius: 3,
                    transition: "opacity 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.8";
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.3";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  &times;
                </span>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addTab}
          title="New Tab"
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            padding: "4px 8px",
            fontSize: 16,
            lineHeight: 1,
            borderRadius: 4,
            flexShrink: 0,
            fontFamily: "var(--font)",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
        >
          +
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          background: "rgba(0,0,0,0.2)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => navigate(inputValue)}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            borderRadius: 4,
            fontSize: 14,
            fontFamily: "var(--font)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />
            <polyline points="15 9 9 9 9 15" />
          </svg>
        </button>
        <input
          name="urlInput"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search or enter URL..."
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 6,
            padding: "5px 10px",
            color: "rgba(255,255,255,0.85)",
            fontSize: 12,
            outline: "none",
            fontFamily: "var(--font)",
          }}
          onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(0,122,255,0.4)")}
          onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)")}
        />
      </form>

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {!ready && (
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.3)", fontSize: 13,
              background: "rgba(0,0,0,0.3)",
            }}
          >
            Initializing proxy...
          </div>
        )}
        {tabs.map((tab) => (
          <div
            key={tab.id}
            ref={(el) => { containersRef.current[tab.id] = el; }}
            style={{
              position: "absolute", inset: 0,
              display: tab.id === activeTabId ? "block" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
