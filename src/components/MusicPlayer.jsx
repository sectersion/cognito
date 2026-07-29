import { useEffect, useState } from "react";
import { useStore } from "../store";
import AppIcon from "./AppIcon";

function getMedia() {
  const windows = useStore.getState().windows;
  const browserWin = [...windows].reverse().find((w) => w.type === "browser");
  if (!browserWin) return null;
  const el = document.querySelector(`[data-window-id="${browserWin.id}"] iframe`);
  try {
    const doc = el?.contentWindow?.document;
    return doc ? [...doc.querySelectorAll("audio,video")].find((m) => m.readyState > 0 && !m.ended) : null;
  } catch { return null; }
}

function fmt(t) {
  if (!t || !isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const nowPlaying = useStore((s) => s.nowPlaying);
  const toggleMusicPlayer = useStore((s) => s.toggleMusicPlayer);
  const [ct, setCt] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    if (!nowPlaying) return;
    const id = setInterval(() => {
      const m = getMedia();
      if (m) { setCt(m.currentTime); setDur(m.duration); }
    }, 200);
    return () => clearInterval(id);
  }, [nowPlaying]);

  const togglePlay = () => {
    const m = getMedia();
    if (!m) return;
    m.paused ? m.play() : m.pause();
  };

  const seek = (dir) => {
    const m = getMedia();
    if (!m) return;
    m.currentTime = Math.max(0, Math.min(m.duration || 0, m.currentTime + dir));
  };

  const handleBar = (e) => {
    const m = getMedia();
    if (!m || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    m.currentTime = pct * dur;
  };

  const pct = dur > 0 ? (ct / dur) * 100 : 0;

  return (
    <>
      <div
        onClick={toggleMusicPlayer}
        style={{
          position: "fixed", inset: 0, zIndex: 9996, background: "transparent",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "calc(var(--menubar-height) + 6px)",
          right: 12,
          width: 260,
          zIndex: 9997,
          background: "rgba(60, 70, 100, 0.25)",
          backdropFilter: "blur(60px) saturate(1.6)",
          WebkitBackdropFilter: "blur(60px) saturate(1.6)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "var(--radius-md)",
          animation: "slideDown 0.15s ease",
          padding: 16,
        }}
      >
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
          {nowPlaying ? "Now Playing" : "No audio playing"}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {nowPlaying?.title || "—"}
        </div>

        <div
          onClick={handleBar}
          style={{
            height: 4,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 2,
            cursor: "pointer",
            marginBottom: 12,
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: "var(--accent)",
              borderRadius: 2,
              transition: "width 0.2s linear",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
          <span>{fmt(ct)}</span>
          <span>{fmt(dur)}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <button
            onClick={() => seek(-10)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.5)", padding: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
          >
            <AppIcon name="skipBack" size={18} />
          </button>

          <button
            onClick={togglePlay}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: nowPlaying ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          >
            <AppIcon name={nowPlaying?.playing ? "pause" : "play"} size={18} />
          </button>

          <button
            onClick={() => seek(10)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.5)", padding: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
          >
            <AppIcon name="skipForward" size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
