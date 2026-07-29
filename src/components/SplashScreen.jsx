import { useEffect, useState } from "react";

export default function SplashScreen({ hidden }) {
  const [phase, setPhase] = useState("boot");
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("logo"), 400);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (!hidden) return;
    const t = setTimeout(() => setRemoved(true), 1200);
    return () => clearTimeout(t);
  }, [hidden]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: removed ? "none" : "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        zIndex: 9999,
        transition: "opacity 1.2s ease",
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
      }}
    >
      {phase === "boot" ? (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid rgba(255,255,255,0.1)",
              borderTopColor: "#007aff",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 14,
              letterSpacing: "0.3px",
            }}
          >
            Starting Cognito...
          </p>
        </div>
      ) : (
        <div style={{ textAlign: "center", animation: "fadeIn 0.6s ease" }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.5))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Cognito
          </h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 4 }}>
            WebOS
          </p>
        </div>
      )}
    </div>
  );
}
