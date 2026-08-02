import { useState, useRef, useEffect } from "react";
import { registerSW } from "../utils/register-sw";
import { timeout } from "../utils/browser-helpers";

let scramjetPromise = null;
let scramjetController = null;
let baremuxConnection = null;

async function clearScramjetDB() {
	try {
		const dbs = await indexedDB.databases();
		for (const db of dbs) {
			await new Promise((resolve, reject) => {
				const req = indexedDB.deleteDatabase(db.name);
				req.onsuccess = resolve;
				req.onerror = () => reject(req.error);
				req.onblocked = resolve;
			});
		}
	} catch (e) {
		console.warn("Failed to clear Scramjet DB:", e);
	}
}

function getScramjet() {
	if (scramjetPromise) return scramjetPromise;
	scramjetPromise = (async () => {
		const { ScramjetController } = window.$scramjetLoadController();
		const controller = new ScramjetController({
			files: {
				wasm: "/scram/scramjet.wasm.wasm",
				all: "/scram/scramjet.all.js",
				sync: "/scram/scramjet.sync.js",
			},
		});
		await controller.init();
		scramjetController = controller;
		baremuxConnection = new window.BareMux.BareMuxConnection(
			"/baremux/worker.js"
		);
		return { controller, connection: baremuxConnection };
	})();
	scramjetPromise.catch(() => {
		scramjetPromise = null;
		scramjetController = null;
		baremuxConnection = null;
	});
	return scramjetPromise;
}

async function ensureTransport() {
	console.log("[cognito-debug] Step 1: Registering service worker...");
	try {
		await registerSW();
		console.log("[cognito-debug] Step 1: SW registered");
	} catch (e) {
		console.warn("[cognito-debug] SW registration failed:", e);
	}
	console.log("[cognito-debug] Step 2: Initializing Scramjet...");
	const { connection } = await getScramjet();
	console.log("[cognito-debug] Step 2: Scramjet initialized");
	const wispUrl =
		(location.protocol === "https:" ? "wss" : "ws") +
		"://" +
		location.host +
		"/wisp/";
	console.log("[cognito-debug] Step 3: Setting transport to", wispUrl);
	const transport = await connection.getTransport();
	console.log("[cognito-debug] Current transport:", transport);
	if (transport !== "/libcurl/index.mjs") {
		await connection.setTransport("/libcurl/index.mjs", [
			{ websocket: wispUrl },
		]);
		console.log("[cognito-debug] Step 3: Transport set");
	}
}

export function useScramjet(setScramjetStatus) {
	const [ready, setReady] = useState(false);
	const initRef = useRef({ done: false });

	useEffect(() => {
		if (initRef.current.done) return;
		initRef.current.done = true;
		(async () => {
			setScramjetStatus("connecting");
			for (let attempt = 0; attempt < 3; attempt++) {
				try {
					await Promise.race([ensureTransport(), timeout(8000)]);
					setScramjetStatus("connected");
					setReady(true);
					return;
				} catch (e) {
					if (
						e.message?.includes("object store") ||
						e.message?.includes("not found")
					) {
						console.warn("Scramjet DB issue, clearing and retrying...", e);
						await clearScramjetDB();
						scramjetPromise = null;
						scramjetController = null;
						baremuxConnection = null;
						continue;
					}
					if (e.message?.includes("Timed out")) {
						setScramjetStatus("fallback");
						console.warn("Transport init timed out, showing browser UI anyway");
						setReady(true);
						return;
					}
					console.error("Scramjet init error:", e);
					setScramjetStatus("error");
					setReady(true);
					return;
				}
			}
			setReady(true);
		})();
	}, [setScramjetStatus]);

	const getController = () => scramjetController;
	const getBaremux = () => baremuxConnection;

	return { ready, getController, getBaremux, ensureTransport };
}
