import { useState } from "react";
import { useStore } from "../store";
import AppIcon from "./AppIcon";

export default function AppLauncher() {
  const apps = useStore((s) => s.apps);
  const openWindow = useStore((s) => s.openWindow);
  const toggleAppLauncher = useStore((s) => s.toggleAppLauncher);
  const [query, setQuery] = useState("");

  const filtered = query
    ? apps.filter(
        (a) =>
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          a.description?.toLowerCase().includes(query.toLowerCase())
      )
    : apps;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9997,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(40, 50, 80, 0.25)",
        backdropFilter: "blur(80px) saturate(1.6)",
        WebkitBackdropFilter: "blur(80px) saturate(1.6)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleAppLauncher();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          padding: "0 20px",
          marginBottom: 32,
        }}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps..."
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "12px 16px",
            color: "rgba(255,255,255,0.85)",
            fontSize: 16,
            outline: "none",
            textAlign: "center",
            fontFamily: "var(--font)",
            fontWeight: 500,
          }}
          onFocus={(e) =>
            (e.currentTarget.style.border = "1px solid rgba(0,122,255,0.4)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)")
          }
          onKeyDown={(e) => {
            if (e.key === "Escape") toggleAppLauncher();
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: 16,
          width: "100%",
          maxWidth: 640,
          padding: "0 20px",
        }}
      >
        {filtered.map((app) => (
          <button
            key={app.id}
            onClick={() => {
              openWindow(app.id);
              toggleAppLauncher();
            }}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: 14,
              padding: "16px 8px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s ease",
              fontFamily: "var(--font)",
              color: "rgba(255,255,255,0.7)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.04)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <AppIcon name={app.iconName} size={32} />
            <span style={{ fontSize: 12, fontWeight: 500 }}>{app.name}</span>
            {app.description && (
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {app.description}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
