import { useStore } from "../store";
import { useClock } from "../hooks/useClock";
import AppIcon from "./AppIcon";
import MusicPlayer from "./MusicPlayer";

export default function MenuBar() {
  const now = useClock();
  const windows = useStore((s) => s.windows);
  const activeWindowId = useStore((s) => s.activeWindowId);
  const toggleControlCenter = useStore((s) => s.toggleControlCenter);
  const toggleNotificationCenter = useStore((s) => s.toggleNotificationCenter);
  const toggleAppLauncher = useStore((s) => s.toggleAppLauncher);
  const nowPlaying = useStore((s) => s.nowPlaying);
  const showMusicPlayer = useStore((s) => s.showMusicPlayer);
  const toggleMusicPlayer = useStore((s) => s.toggleMusicPlayer);

  const activeWindow = windows.find((w) => w.id === activeWindowId);
  const appName = activeWindow ? activeWindow.title : "Cognito";

  const timeStr = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  const dateStr = now.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <>
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "var(--menubar-height)",
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        background: "rgba(60, 70, 100, 0.2)",
        backdropFilter: "blur(50px) saturate(1.6)",
        WebkitBackdropFilter: "blur(50px) saturate(1.6)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      <div
        onClick={toggleAppLauncher}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          padding: "2px 8px",
          borderRadius: 6,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span style={{ fontSize: 16, fontWeight: 300, lineHeight: 1 }}>&#x25C7;</span>
        <span style={{ fontWeight: 600, letterSpacing: "-0.3px" }}>{appName}</span>
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >


        {nowPlaying && (
          <button
            onClick={toggleMusicPlayer}
            style={{
              background: showMusicPlayer ? "rgba(0,122,255,0.15)" : "none",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              padding: "2px 6px",
              borderRadius: 6,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "var(--font)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={(e) => { if (!showMusicPlayer) e.currentTarget.style.background = "none"; }}
          >
            <AppIcon name="music" size={14} />
          </button>
        )}

        <button
          onClick={toggleControlCenter}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "var(--font)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10h-10V2z" />
            <path d="M12 12 2.93 17.07" />
            <path d="M12 12 21 7" />
            <path d="M7.5 12A4.5 4.5 0 0 1 12 7.5" />
          </svg>
        </button>

        <button
          onClick={toggleNotificationCenter}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "var(--font)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
            fontWeight: 500,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{dateStr}</span>
          <span>{timeStr}</span>
        </div>
      </div>
    </div>
      {showMusicPlayer && <MusicPlayer />}
    </>
  );
}
