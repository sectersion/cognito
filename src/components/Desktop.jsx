export default function Desktop({ children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0a0f url(/background.jpg) center/cover no-repeat",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 100% 70% at 50% -30%, rgba(0,150,255,0.15) 0%, transparent 60%), radial-gradient(ellipse 70% 60% at 80% 90%, rgba(140,80,255,0.12) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(0,220,255,0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}
