import { useStore } from "../store";
import AppIcon from "./AppIcon";

function Tile({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active
          ? "rgba(0, 122, 255, 0.15)"
          : "rgba(255,255,255,0.03)",
        border: "1px solid",
        borderColor: active
          ? "rgba(0, 122, 255, 0.3)"
          : "rgba(255,255,255,0.04)",
        borderRadius: "var(--radius-sm)",
        padding: "12px 8px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font)",
        color: active
          ? "rgba(255,255,255,0.9)"
          : "rgba(255,255,255,0.5)",
        transition: "all 0.15s",
        flex: 1,
        minWidth: 0,
      }}
      onMouseEnter={(e) => {
        if (!active)
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        if (!active)
          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
    >
      <AppIcon name={icon} size={18} />
      <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
    </button>
  );
}

export default function ControlCenter() {
  const toggleControlCenter = useStore((s) => s.toggleControlCenter);
  const wifiEnabled = useStore((s) => s.wifiEnabled);
  const bluetoothEnabled = useStore((s) => s.bluetoothEnabled);
  const doNotDisturb = useStore((s) => s.doNotDisturb);
  const toggleWifi = useStore((s) => s.toggleWifi);
  const toggleBluetooth = useStore((s) => s.toggleBluetooth);
  const toggleDND = useStore((s) => s.toggleDND);

  return (
    <>
      <div
        onClick={toggleControlCenter}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9996,
          background: "transparent",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "calc(var(--menubar-height) + 6px)",
          right: 12,
          width: 240,
          zIndex: 9997,
          background: "rgba(60, 70, 100, 0.25)",
          backdropFilter: "blur(60px) saturate(1.6)",
          WebkitBackdropFilter: "blur(60px) saturate(1.6)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "var(--radius-md)",
          animation: "slideDown 0.15s ease",
          padding: 12,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4,
          }}
        >
          <Tile icon="wifi" label="WiFi" active={wifiEnabled} onClick={toggleWifi} />
          <Tile icon="smartphone" label="Bluetooth" active={bluetoothEnabled} onClick={toggleBluetooth} />
          <Tile icon="bell" label="DND" active={doNotDisturb} onClick={toggleDND} />
          <Tile icon="music" label="Music" active={false} />
        </div>
      </div>
    </>
  );
}
