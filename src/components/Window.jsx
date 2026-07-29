import { useRef, useCallback, useState } from "react";
import { useStore } from "../store";
import Browser from "./Browser";
import Settings from "./Settings";

const APPS = {
  browser: Browser,
  settings: Settings,
};

export default function Window({ win }) {
  const focusWindow = useStore((s) => s.focusWindow);
  const closeWindow = useStore((s) => s.closeWindow);
  const minimizeWindow = useStore((s) => s.minimizeWindow);
  const maximizeWindow = useStore((s) => s.maximizeWindow);
  const updateWindow = useStore((s) => s.updateWindow);
  const activeWindowId = useStore((s) => s.activeWindowId);
  const titleBarRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const [resize, setResize] = useState(null);

  const isActive = activeWindowId === win.id;
  const isMaximized = win.isMaximized;

  const handleMouseDown = useCallback(
    (e) => {
      focusWindow(win.id);
      if (isMaximized) return;
      const rect = titleBarRef.current.parentElement.getBoundingClientRect();
      setDrag({
        startX: e.clientX,
        startY: e.clientY,
        origX: win.x,
        origY: win.y,
      });
    },
    [win.id, win.x, win.y, focusWindow, isMaximized]
  );

  const handleResizeStart = useCallback(
    (e, edge) => {
      e.stopPropagation();
      focusWindow(win.id);
      if (isMaximized) return;
      setResize({
        startX: e.clientX,
        startY: e.clientY,
        origX: win.x,
        origY: win.y,
        origW: win.width,
        origH: win.height,
        edge,
      });
    },
    [win.id, win.x, win.y, win.width, win.height, focusWindow, isMaximized]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (drag) {
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        updateWindow(win.id, {
          x: drag.origX + dx,
          y: Math.max(0, drag.origY + dy),
        });
      }
      if (resize) {
        const dx = e.clientX - resize.startX;
        const dy = e.clientY - resize.startY;
        const patch = {};
        if (resize.edge.includes("e")) {
          patch.width = Math.max(400, resize.origW + dx);
        }
        if (resize.edge.includes("w")) {
          patch.width = Math.max(400, resize.origW - dx);
          patch.x = resize.origX + dx;
        }
        if (resize.edge.includes("s")) {
          patch.height = Math.max(300, resize.origH + dy);
        }
        if (resize.edge.includes("n")) {
          patch.height = Math.max(300, resize.origH - dy);
          patch.y = resize.origY + dy;
        }
        updateWindow(win.id, patch);
      }
    },
    [drag, resize, updateWindow, win.id]
  );

  const handleMouseUp = useCallback(() => {
    setDrag(null);
    setResize(null);
  }, []);

  const AppComponent = APPS[win.appId];

  return (
    <div
      data-window-id={win.id}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: isMaximized ? "fixed" : "absolute",
        left: isMaximized ? 0 : win.x,
        top: isMaximized ? "var(--menubar-height)" : win.y,
        width: isMaximized ? "100%" : win.width,
        height: isMaximized ? "calc(100vh - var(--menubar-height))" : win.height,
        zIndex: win.zIndex,
        display: "flex",
        flexDirection: "column",
        borderRadius: isMaximized ? 0 : "var(--radius-md)",
        overflow: "hidden",
        boxShadow: isActive
          ? "0 16px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)"
          : "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
        background: "rgba(60, 70, 100, 0.25)",
        backdropFilter: "blur(50px) saturate(1.6)",
        WebkitBackdropFilter: "blur(50px) saturate(1.6)",
        opacity: win.minimized ? 0 : 1,
        pointerEvents: win.minimized ? "none" : "auto",
        transition: isActive ? "none" : "box-shadow 0.25s ease",
        animation: "scaleIn 0.2s ease",
      }}
      onClick={() => focusWindow(win.id)}
    >
      <div
        ref={titleBarRef}
        onMouseDown={handleMouseDown}
        onDoubleClick={() => maximizeWindow(win.id)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 12px",
          cursor: "default",
          flexShrink: 0,
          minHeight: 36,
          background: isActive
            ? "rgba(255,255,255,0.06)"
            : "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div
          style={{ display: "flex", gap: 6, marginRight: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            onClick={() => closeWindow(win.id)}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#ff5f57",
              cursor: "pointer",
              transition: "filter 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
          />
          <div
            onClick={() => minimizeWindow(win.id)}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#febc2e",
              cursor: "pointer",
              transition: "filter 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
          />
          <div
            onClick={() => maximizeWindow(win.id)}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#28c840",
              cursor: "pointer",
              transition: "filter 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
          />
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "rgba(255,255,255,0.6)",
            marginLeft: 6,
          }}
        >
          {win.icon} {win.title}
        </span>
      </div>

      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {AppComponent ? (
          <AppComponent win={win} />
        ) : (
          <Browser win={win} />
        )}
      </div>

      {["n", "s", "e", "w"].map((edge) => (
        <div
          key={edge}
          onMouseDown={(e) => handleResizeStart(e, edge)}
          style={{
            position: "absolute",
            [edge]: 0,
            [edge === "n" || edge === "s" ? "left" : "top"]: 0,
            [edge === "n" || edge === "s" ? "right" : "bottom"]: 0,
            height: edge === "n" || edge === "s" ? 4 : "100%",
            width: edge === "e" || edge === "w" ? 4 : "100%",
            cursor: { n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize" }[edge],
            zIndex: 10,
          }}
        />
      ))}
      {["ne", "nw", "se", "sw"].map((corner) => (
        <div
          key={corner}
          onMouseDown={(e) => handleResizeStart(e, corner)}
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            bottom: corner.includes("s") ? -2 : undefined,
            top: corner.includes("n") ? -2 : undefined,
            right: corner.includes("e") ? -2 : undefined,
            left: corner.includes("w") ? -2 : undefined,
            cursor: {
              ne: "nesw-resize",
              nw: "nwse-resize",
              se: "nwse-resize",
              sw: "nesw-resize",
            }[corner],
            zIndex: 11,
          }}
        />
      ))}
    </div>
  );
}
