import { useState, useRef, useEffect } from "react";
import { useStore } from "../store";
import AppIcon from "./AppIcon";

export default function Dock() {
  const apps = useStore((s) => s.apps);
  const windows = useStore((s) => s.windows);
  const openWindow = useStore((s) => s.openWindow);
  const focusWindow = useStore((s) => s.focusWindow);
  const toggleAppLauncher = useStore((s) => s.toggleAppLauncher);
  const dockRef = useRef(null);
  const [hoverPos, setHoverPos] = useState(null);

  const openAppIds = new Set(windows.map((w) => w.appId));
  const maxMagnify = 1.2;
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
      style={{
        position: "fixed",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
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
      }}
      ref={dockRef}
      onMouseMove={(e) => setHoverPos(e.clientX)}
      onMouseLeave={() => setHoverPos(null)}
    >
      {apps.map((app, i) => {
        const isOpen = openAppIds.has(app.id);
        const scale = getScale(i, hoverPos);
        return (
          <button
            key={app.id}
            className="dock-icon"
            onClick={() => {
              if (isOpen) {
                const win = windows.find((w) => w.appId === app.id);
                if (win) focusWindow(win.id);
              } else {
                openWindow(app.id);
              }
            }}
            title={app.name}
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
            <AppIcon name={app.iconName} size={24} />
            <div
              style={{
                position: "absolute",
                bottom: -2,
                left: "50%",
                transform: "translateX(-50%)",
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: isOpen
                  ? "rgba(255,255,255,0.7)"
                  : "transparent",
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
        onClick={toggleAppLauncher}
        title="Launchpad"
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
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>
    </div>
  );
}
