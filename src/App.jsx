import { useEffect } from "react";
import { useStore } from "./store";
import { useClock } from "./hooks/useClock";
import MenuBar from "./components/MenuBar";
import Desktop from "./components/Desktop";
import Dock from "./components/Dock";
import WindowManager from "./components/WindowManager";
import AppLauncher from "./components/AppLauncher";
import NotificationCenter from "./components/NotificationCenter";
import ControlCenter from "./components/ControlCenter";
import SplashScreen from "./components/SplashScreen";

export default function App() {
  const loadApps = useStore((s) => s.loadApps);
  const isBooted = useStore((s) => s.isBooted);
  const boot = useStore((s) => s.boot);
  const now = useClock();
  const settings = useStore((s) => s.settings);
  const showNotificationCenter = useStore((s) => s.showNotificationCenter);
  const showControlCenter = useStore((s) => s.showControlCenter);
  const showAppLauncher = useStore((s) => s.showAppLauncher);
  const toggleNotificationCenter = useStore((s) => s.toggleNotificationCenter);
  const toggleControlCenter = useStore((s) => s.toggleControlCenter);
  const windows = useStore((s) => s.windows);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  useEffect(() => {
    const tid = setTimeout(boot, 2000);
    return () => clearTimeout(tid);
  }, [boot]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (showAppLauncher) useStore.getState().toggleAppLauncher();
        if (showNotificationCenter) useStore.getState().toggleNotificationCenter();
        if (showControlCenter) useStore.getState().toggleControlCenter();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showAppLauncher, showNotificationCenter, showControlCenter]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <SplashScreen hidden={isBooted} />
      {isBooted && (
        <Desktop>
          <WindowManager />
          <Dock />
          <MenuBar />
          {showAppLauncher && <AppLauncher />}
          {showNotificationCenter && <NotificationCenter />}
          {showControlCenter && <ControlCenter />}
        </Desktop>
      )}
    </div>
  );
}
