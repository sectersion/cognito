import { useState } from "react";
import { useStore } from "../store";

function SettingRow({ label, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function SettingGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "rgba(255,255,255,0.3)",
          padding: "12px 16px 6px",
        }}
      >
        {title}
      </h3>
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: "var(--radius-sm)",
          margin: "0 12px",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const [se, setSe] = useState(settings.searchEngine);

  const handleSave = () => {
    updateSettings({ searchEngine: se });
  };

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        padding: "8px 0",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "16px 0 8px",
        }}
      >
        <span style={{ fontSize: 32 }}>⚙️</span>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginTop: 4,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          Settings
        </h2>
      </div>

      <SettingGroup title="Search">
        <SettingRow label="Search Engine">
          <input
            value={se}
            onChange={(e) => setSe(e.target.value)}
            placeholder="https://google.com/search?q=%s"
            style={{
              width: 240,
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
            onBlur={(e) => {
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)";
              handleSave();
            }}
          />
        </SettingRow>
      </SettingGroup>

      <SettingGroup title="About">
        <SettingRow label="Version">1.0.0</SettingRow>
        <SettingRow label="Engine">Scramjet</SettingRow>
        <SettingRow label="Framework">Cognito WebOS</SettingRow>
      </SettingGroup>

      <div
        style={{
          padding: "16px",
          textAlign: "center",
          fontSize: 11,
          color: "rgba(255,255,255,0.2)",
        }}
      >
        Apps are configured via applist.json
      </div>
    </div>
  );
}
