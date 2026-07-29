import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "../store";
import { search } from "../utils/search";
import { registerSW } from "../utils/register-sw";

let scramjetPromise = null;
let scramjetController = null;
let baremuxConnection = null;

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
  } catch {
    // indexedDB.databases() not supported
  }
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
  const updateWindow = useStore((s) => s.updateWindow);
  const setNowPlaying = useStore((s) => s.setNowPlaying);
  const iframeRef = useRef(null);
  const frameRef = useRef(null);
  const [url, setUrl] = useState(win.url || "");
  const [inputValue, setInputValue] = useState(win.url || "");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const initRef = useRef({ done: false, navigated: false });

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

  const navigate = useCallback(
    async (input) => {
      const targetUrl = search(input, settings.searchEngine);
      setUrl(targetUrl);
      setInputValue(targetUrl);
      setLoading(true);
      try {
        await Promise.race([ensureTransport(), timeout(8000)]);
        if (!frameRef.current) {
          const frame = scramjetController.createFrame();
          frame.frame.style.cssText =
            "width:100%;height:100%;border:none;background:white;display:block;";
          if (iframeRef.current) {
            iframeRef.current.innerHTML = "";
            iframeRef.current.appendChild(frame.frame);
          }
          if (frameRef.current && frameRef.current.urlchangeCleanup) {
            frameRef.current.urlchangeCleanup();
          }
          const onUrlChange = (e) => {
            setUrl(e.url);
            setInputValue(e.url);
          };
          frame.addEventListener("urlchange", onUrlChange);
          frame.urlchangeCleanup = () => {
            frame.removeEventListener("urlchange", onUrlChange);
          };
          frameRef.current = frame;
        }
        frameRef.current.go(targetUrl);
      } catch (e) {
        console.error("Navigation error:", e);
        if (iframeRef.current) {
          iframeRef.current.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.5);font-size:14px;">Failed to load: ${e.message}</div>`;
          frameRef.current = null;
        }
      } finally {
        setLoading(false);
      }
    },
    [settings.searchEngine]
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
        const iframe = iframeRef.current?.querySelector("iframe");
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
  }, [ready, setNowPlaying]);

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
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          background: "rgba(0,0,0,0.2)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => navigate(url)}
          disabled={loading}
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
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "none")
          }
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
          onFocus={(e) =>
            (e.currentTarget.style.border = "1px solid rgba(0,122,255,0.4)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)")
          }
        />
        {loading && (
          <div
            style={{
              width: 14,
              height: 14,
              border: "2px solid rgba(255,255,255,0.1)",
              borderTopColor: "#007aff",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
              flexShrink: 0,
            }}
          />
        )}
      </form>
      <div
        ref={iframeRef}
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {!ready && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "rgba(255,255,255,0.3)",
              fontSize: 13,
            }}
          >
            Initializing proxy...
          </div>
        )}
      </div>
    </div>
  );
}
