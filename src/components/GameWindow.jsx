import { useCallback, useEffect, useRef } from "react";

export default function GameWindow({ win }) {
	const frameRef = useRef(null);
	const focusGame = useCallback(() => {
		const frame = frameRef.current;
		if (!frame) return;
		frame.focus();
		try {
			frame.contentWindow?.focus();
			const document = frame.contentDocument;
			const target =
				document?.getElementById("game_frame") ||
				document?.querySelector("canvas") ||
				document?.body;
			if (target) {
				if (!target.hasAttribute("tabindex"))
					target.setAttribute("tabindex", "0");
				target.focus();
			}
		} catch (e) {
			console.warn("Failed to focus game:", e);
		}
	}, []);

	useEffect(() => {
		const timer = window.setInterval(focusGame, 250);
		const stop = window.setTimeout(() => window.clearInterval(timer), 6000);
		return () => {
			window.clearInterval(timer);
			window.clearTimeout(stop);
		};
	}, [focusGame, win.gameUrl]);

	return (
		<div className="game-window">
			<iframe
				ref={frameRef}
				src={win.gameUrl}
				title={win.title}
				tabIndex="0"
				onLoad={focusGame}
				onPointerDown={focusGame}
				onClick={focusGame}
				allow="fullscreen; autoplay; gamepad"
				allowFullScreen
				onError={(event) => {
					event.currentTarget.replaceWith(
						Object.assign(document.createElement("div"), {
							className: "browser-error",
							textContent: "This game could not be loaded.",
						})
					);
				}}
			/>
		</div>
	);
}
