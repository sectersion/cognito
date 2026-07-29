import { useStore } from "../store";
import Window from "./Window";

export default function WindowManager() {
  const windows = useStore((s) => s.windows);

  if (windows.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        paddingTop: "var(--menubar-height)",
        paddingBottom: "calc(var(--dock-height) + 16px)",
      }}
    >
      {windows.map((win) => (
        <Window key={win.id} win={win} />
      ))}
    </div>
  );
}
