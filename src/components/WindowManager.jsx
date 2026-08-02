import { useStore } from "../store";
import Window from "./Window";
import ErrorBoundary from "./ErrorBoundary";

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
				<ErrorBoundary key={win.id}>
					<Window win={win} />
				</ErrorBoundary>
			))}
		</div>
	);
}
