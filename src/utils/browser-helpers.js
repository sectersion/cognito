export function timeout(ms) {
	return new Promise((_, reject) =>
		setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
	);
}

export function readFrameState(frame) {
	try {
		const iframe = frame?.frame || frame;
		const location = iframe?.contentWindow?.location;
		const document = iframe?.contentDocument;
		return { url: location?.href || "", title: document?.title || "" };
	} catch {
		return { url: "", title: "" };
	}
}

export function displayUrl(url, scramjetController) {
	if (!url) return "";
	const value = String(url);
	try {
		return scramjetController?.decodeUrl(value) || value;
	} catch {
		return value;
	}
}

export function callFrame(frame, method) {
	try {
		if (typeof frame?.[method] === "function") {
			frame[method]();
			return true;
		}
	} catch (e) {
		console.warn("Frame method call failed:", e);
	}
	return false;
}

export function hideDocumentScrollbar(frame) {
	try {
		const document = frame?.frame?.contentDocument;
		if (!document?.head) return;
		const styleId = "cognito-standalone-scrollbar";
		if (document.getElementById(styleId)) return;
		const style = document.createElement("style");
		style.id = styleId;
		style.textContent =
			"* { scrollbar-width: none; -ms-overflow-style: none; } *::-webkit-scrollbar { width: 0; height: 0; }";
		document.head.appendChild(style);
	} catch (e) {
		console.warn("Failed to hide scrollbar:", e);
	}
}

export function errorMessage(error) {
	const message = error instanceof Error ? error.message : String(error || "");
	return message || "The browser could not start the page.";
}
