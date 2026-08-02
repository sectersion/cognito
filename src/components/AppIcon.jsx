import { useEffect, useId, useState } from "react";
import {
	FiArrowLeft,
	FiArrowRight,
	FiGlobe,
	FiSettings,
	FiSun,
	FiInfo,
	FiSliders,
	FiFolder,
	FiMusic,
	FiImage,
	FiFilm,
	FiMessageSquare,
	FiMail,
	FiCalendar,
	FiClock,
	FiMapPin,
	FiCamera,
	FiBook,
	FiTerminal,
	FiCode,
	FiDatabase,
	FiLock,
	FiUser,
	FiSearch,
	FiDownload,
	FiUpload,
	FiTrash2,
	FiStar,
	FiHeart,
	FiBell,
	FiShield,
	FiWifi,
	FiBattery,
	FiMonitor,
	FiSmartphone,
	FiTablet,
	FiLayers,
	FiBox,
	FiGrid,
	FiPlay,
	FiPause,
	FiSkipBack,
	FiSkipForward,
	FiRefreshCw,
	FiX,
} from "react-icons/fi";

function CompassMark({ size, style, label }) {
	const gradientId = useId().replace(/:/g, "");

	return (
		<svg
			aria-hidden={label ? undefined : true}
			aria-label={label}
			width={size}
			height={size}
			style={{ display: "block", ...style }}
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle cx="24" cy="24" r="20" fill={`url(#${gradientId}-face)`} />
			<circle
				cx="24"
				cy="24"
				r="19"
				stroke="rgba(255,255,255,0.75)"
				strokeWidth="1.5"
			/>
			<path
				d="M30.9 17.1 26.2 27.1 17.1 30.9l4.7-10 9.1-3.8Z"
				fill={`url(#${gradientId}-needle)`}
			/>
			<path
				d="m30.9 17.1-4.7 10-9.1 3.8 4.7-10 9.1-3.8Z"
				stroke="white"
				strokeWidth="1.2"
				strokeLinejoin="round"
			/>
			<circle cx="24" cy="24" r="2" fill="white" />
			<defs>
				<linearGradient
					id={`${gradientId}-face`}
					x1="8"
					y1="6"
					x2="38"
					y2="43"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#f8fbff" />
					<stop offset="1" stopColor="#c7d7ed" />
				</linearGradient>
				<linearGradient
					id={`${gradientId}-needle`}
					x1="28"
					y1="17"
					x2="19"
					y2="31"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#ff4f67" />
					<stop offset="0.5" stopColor="#f22f4e" />
					<stop offset="0.51" stopColor="#f8fbff" />
					<stop offset="1" stopColor="#b9cbe1" />
				</linearGradient>
			</defs>
		</svg>
	);
}

const iconMap = {
	compassFallback: CompassMark,
	back: FiArrowLeft,
	forward: FiArrowRight,
	globe: FiGlobe,
	settings: FiSettings,
	sliders: FiSliders,
	folder: FiFolder,
	music: FiMusic,
	image: FiImage,
	film: FiFilm,
	message: FiMessageSquare,
	mail: FiMail,
	calendar: FiCalendar,
	clock: FiClock,
	map: FiMapPin,
	camera: FiCamera,
	book: FiBook,
	terminal: FiTerminal,
	code: FiCode,
	database: FiDatabase,
	lock: FiLock,
	user: FiUser,
	search: FiSearch,
	download: FiDownload,
	upload: FiUpload,
	trash: FiTrash2,
	star: FiStar,
	heart: FiHeart,
	bell: FiBell,
	shield: FiShield,
	wifi: FiWifi,
	battery: FiBattery,
	monitor: FiMonitor,
	smartphone: FiSmartphone,
	tablet: FiTablet,
	layers: FiLayers,
	box: FiBox,
	grid: FiGrid,
	"game-library": FiGrid,
	sun: FiSun,
	info: FiInfo,
	play: FiPlay,
	pause: FiPause,
	skipBack: FiSkipBack,
	skipForward: FiSkipForward,
	reload: FiRefreshCw,
	close: FiX,
};

const assetIcons = {
	compass: "/assets/whitesur/web-browser.svg",
	"preferences-system": "/assets/macosicons-settings.png",
	youtube: "/assets/whitesur/youtube.svg",
	discord: "/assets/whitesur/discord.svg",
	"cloud-gaming": "/assets/cloud-gaming.svg",
	"game-library": "/assets/steam.svg",
};

export default function AppIcon({ name, size = 24, style, label }) {
	const [assetFailed, setAssetFailed] = useState(false);
	useEffect(() => setAssetFailed(false), [name]);
	if (assetIcons[name]) {
		if (assetFailed) {
			const FallbackIcon = iconMap[name] || FiBox;
			return (
				<FallbackIcon
					size={size}
					aria-hidden={!label}
					aria-label={label}
					style={style}
				/>
			);
		}
		return (
			<img
				src={assetIcons[name]}
				alt={label || ""}
				aria-hidden={label ? undefined : true}
				width={size}
				height={size}
				onError={() => setAssetFailed(true)}
				style={{ display: "block", ...style }}
			/>
		);
	}

	const Icon = iconMap[name] || FiBox;
	return (
		<Icon
			size={size}
			aria-hidden={label ? undefined : true}
			aria-label={label}
			style={{ display: "block", ...style }}
		/>
	);
}

const tileGradients = {
	compass: "linear-gradient(145deg, #4d83d8 0%, #1d4f9e 52%, #12316a 100%)",
	settings: "linear-gradient(145deg, #aeb9c8 0%, #697789 50%, #394653 100%)",
	default: "linear-gradient(145deg, #6c8cff 0%, #4253bf 52%, #252a75 100%)",
};

export function AppTile({ name, size = 56, label, style }) {
	const tileLabel = label || name;
	return (
		<span
			className="app-tile"
			role={tileLabel ? "img" : undefined}
			aria-label={tileLabel || undefined}
			aria-hidden={tileLabel ? undefined : true}
			style={{
				width: size,
				height: size,
				display: "inline-flex",
				flexShrink: 0,
				alignItems: "center",
				justifyContent: "center",
				overflow: "hidden",
				borderRadius: Math.round(size * 0.23),
				background: assetIcons[name]
					? "transparent"
					: tileGradients[name] || tileGradients.default,
				border: assetIcons[name] ? "none" : "1px solid rgba(255,255,255,0.24)",
				boxShadow: assetIcons[name]
					? "none"
					: "inset 0 1px 1px rgba(255,255,255,0.35), 0 5px 12px rgba(0,0,0,0.28)",
				...style,
			}}
		>
			<AppIcon
				name={name}
				size={assetIcons[name] ? size : Math.round(size * 0.58)}
			/>
		</span>
	);
}
