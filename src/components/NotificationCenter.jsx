import { useStore } from "../store";

export default function NotificationCenter() {
  const notifications = useStore((s) => s.notifications);
  const removeNotification = useStore((s) => s.removeNotification);
  const toggleNotificationCenter = useStore((s) => s.toggleNotificationCenter);

  return (
    <>
      <div
        onClick={toggleNotificationCenter}
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
          top: "var(--menubar-height)",
          right: 0,
          bottom: 0,
          width: 320,
          zIndex: 9997,
          display: "flex",
          flexDirection: "column",
          background: "rgba(60, 70, 100, 0.25)",
          backdropFilter: "blur(60px) saturate(1.6)",
          WebkitBackdropFilter: "blur(60px) saturate(1.6)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          animation: "slideDown 0.2s ease",
          padding: 16,
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Notifications
          </h2>
          {notifications.length > 1 && (
            <button
              onClick={() => {
                notifications.forEach((n) => removeNotification(n.id));
              }}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "var(--font)",
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.2)",
              fontSize: 13,
              marginTop: 40,
            }}
          >
            No notifications
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {n.title}
                  </span>
                  <button
                    onClick={() => removeNotification(n.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.2)",
                      cursor: "pointer",
                      fontSize: 14,
                      padding: 0,
                      lineHeight: 1,
                      fontFamily: "var(--font)",
                    }}
                  >
                    &times;
                  </button>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 4,
                    lineHeight: 1.4,
                  }}
                >
                  {n.message}
                </p>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.2)",
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  {n.time?.toLocaleTimeString?.([], {
                    hour: "numeric",
                    minute: "2-digit",
                  }) || ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
