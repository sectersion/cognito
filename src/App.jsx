import { useEffect } from "react";
import { useStore } from "./store";
import { useClock } from "./hooks/useClock";
import MenuBar from "./components/MenuBar";
import Desktop from "./components/Desktop";
import Dock from "./components/Dock";
import WindowManager from "./components/WindowManager";
import ErrorBoundary from "./components/ErrorBoundary";
import AppLauncher from "./components/AppLauncher";
import NotificationCenter from "./components/NotificationCenter";
import SplashScreen from "./components/SplashScreen";
import WindowOverview from "./components/WindowOverview";

function openAboutBlankShell() {
	if (window.name === "cognito-about-blank") return true;
	try {
		const popup = window.open("about:blank", "_blank");
		if (!popup) return false;
		popup.name = "cognito-about-blank";
		const html = document.documentElement.outerHTML.replace(
			"<head>",
			`<head><base href="${window.location.origin}/">`
		);
		popup.document.open();
		popup.document.write(html);
		popup.document.close();
		return true;
	} catch {
		return false;
	}
}

function loadBlobShell() {
	if (window.location.protocol === "blob:") return;
	try {
		const html = document.documentElement.outerHTML.replace(
			"<head>",
			`<head><base href="${window.location.origin}/">`
		);
		const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
		window.location.replace(url);
	} catch {
		// Blob URLs can be unavailable in restricted browser contexts.
	}
}

export default function App() {
	const loadApps = useStore((s) => s.loadApps);
	const isBooted = useStore((s) => s.isBooted);
	const boot = useStore((s) => s.boot);
	const now = useClock();
	const showNotificationCenter = useStore((s) => s.showNotificationCenter);
	const showWindowOverview = useStore((s) => s.showWindowOverview);
	const showAppLauncher = useStore((s) => s.showAppLauncher);
	const toggleNotificationCenter = useStore((s) => s.toggleNotificationCenter);
	const windows = useStore((s) => s.windows);
	const aboutBlankCloaking = useStore((s) => s.settings.aboutBlankCloaking);
	const blobUrlCloaking = useStore((s) => s.settings.blobUrlCloaking);

	useEffect(() => {
		if (aboutBlankCloaking && window.name !== "cognito-about-blank") {
			openAboutBlankShell();
		}
	}, [aboutBlankCloaking]);

	useEffect(() => {
		if (
			blobUrlCloaking &&
			!aboutBlankCloaking &&
			window.name !== "cognito-about-blank"
		) {
			loadBlobShell();
		}
	}, [aboutBlankCloaking, blobUrlCloaking]);

	useEffect(() => {
		loadApps();
	}, [loadApps]);

	useEffect(() => {
		const tid = setTimeout(boot, 2000);
		return () => clearTimeout(tid);
	}, [boot]);

	useEffect(() => {
		const handler = (e) => {
			if (e.key === "F3" || (e.key === "ArrowUp" && e.ctrlKey)) {
				e.preventDefault();
				useStore.getState().toggleWindowOverview();
				return;
			}
			if (e.key === "Escape") {
				if (useStore.getState().showWindowOverview) {
					useStore.getState().closeWindowOverview();
					return;
				}
				if (showAppLauncher) useStore.getState().toggleAppLauncher();
				if (showNotificationCenter)
					useStore.getState().toggleNotificationCenter();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [showAppLauncher, showNotificationCenter]);

	return (
		<div className="app-shell">
			<SplashScreen hidden={isBooted} />
			{isBooted && (
				<Desktop>
					<ErrorBoundary>
						<WindowManager />
					</ErrorBoundary>
					<Dock />
					<MenuBar />
					{showAppLauncher && <AppLauncher />}
					{showNotificationCenter && <NotificationCenter />}
					{showWindowOverview && <WindowOverview />}
				</Desktop>
			)}
		</div>
	);
}
