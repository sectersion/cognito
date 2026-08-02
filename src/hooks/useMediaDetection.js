import { useRef, useEffect } from "react";

export function useMediaDetection({
	ready,
	activeTabId,
	containersRef,
	setNowPlaying,
}) {
	const audioCheckRef = useRef(null);
	const lastMedia = useRef(null);

	useEffect(() => {
		if (!ready) return;
		audioCheckRef.current = setInterval(() => {
			try {
				const container = containersRef.current[activeTabId];
				const iframe = container?.querySelector("iframe");
				const doc = iframe?.contentWindow?.document;
				if (!doc) {
					setNowPlaying(null);
					lastMedia.current = null;
					return;
				}
				const allMedia = [...doc.querySelectorAll("audio,video")].filter(
					(el) => el.readyState > 0 && !el.ended
				);
				if (allMedia.length === 0) {
					setNowPlaying(null);
					lastMedia.current = null;
					return;
				}
				const active =
					allMedia.find((el) => !el.paused && !el.muted && el.volume > 0) ||
					allMedia[0];
				lastMedia.current = active;
				const title =
					doc.title || active.getAttribute("title") || "Now Playing";
				setNowPlaying({
					title,
					playing: !active.paused,
					currentTime: active.currentTime,
					duration: active.duration,
				});
			} catch {
				setNowPlaying(null);
				lastMedia.current = null;
			}
		}, 500);
		return () => {
			clearInterval(audioCheckRef.current);
			audioCheckRef.current = null;
		};
	}, [ready, setNowPlaying, activeTabId]);
}
