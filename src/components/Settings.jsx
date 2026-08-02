import { useState } from "react";
import { useStore } from "../store";
import AppIcon, { AppTile } from "./AppIcon";

const SECTIONS = [
	["general", "General", "sliders"],
	["appearance", "Appearance", "sun"],
	["dock", "Dock & Launcher", "dock"],
	["browser", "Safari", "globe"],
	["privacy", "Privacy & Security", "lock"],
	["network", "Network", "wifi"],
	["notifications", "Notifications", "bell"],
	["about", "About", "info"],
];

function Toggle({ checked, onChange, label }) {
	return (
		<button
			type="button"
			className={`settings-toggle${checked ? " active" : ""}`}
			aria-pressed={checked}
			aria-label={label}
			onClick={() => onChange(!checked)}
		>
			<span />
		</button>
	);
}

function SettingRow({ label, description, children }) {
	return (
		<div className="settings-row">
			<div className="settings-row-copy">
				<strong>{label}</strong>
				{description && <span>{description}</span>}
			</div>
			{children}
		</div>
	);
}

function SectionCard({ title, children }) {
	return (
		<section className="settings-card">
			{title && <h3>{title}</h3>}
			{children}
		</section>
	);
}

function Choice({ value, current, label, onClick }) {
	return (
		<button
			type="button"
			className={`settings-choice${value === current ? " selected" : ""}`}
			aria-pressed={value === current}
			onClick={() => onClick(value)}
		>
			{label}
		</button>
	);
}

function Icon({ name }) {
	return (
		<span className="settings-section-icon" aria-hidden="true">
			<AppIcon name={name} size={14} />
		</span>
	);
}

function General({ settings, update }) {
	const resetSettings = useStore((s) => s.resetSettings);
	const [confirmingReset, setConfirmingReset] = useState(false);
	const reset = () => {
		resetSettings();
		setConfirmingReset(false);
	};

	return (
		<>
			<SectionCard title="Accessibility">
				<SettingRow
					label="Reduce transparency"
					description="Use more solid surfaces throughout Cognito"
				>
					<Toggle
						label="Reduce transparency"
						checked={settings.reduceTransparency}
						onChange={(value) => update({ reduceTransparency: value })}
					/>
				</SettingRow>
				<SettingRow
					label="Reduce motion"
					description="Minimize interface animations"
				>
					<Toggle
						label="Reduce motion"
						checked={settings.reduceMotion}
						onChange={(value) => update({ reduceMotion: value })}
					/>
				</SettingRow>
			</SectionCard>
			<SectionCard title="System">
				<SettingRow label="Wallpaper" description="Desktop background">
					<span className="settings-muted">Cognito default</span>
				</SettingRow>
				<SettingRow
					label="Reset settings"
					description="Restore preference settings to their defaults"
				>
					<button
						type="button"
						className="settings-danger"
						onClick={() => setConfirmingReset(true)}
					>
						Reset settings
					</button>
				</SettingRow>
			</SectionCard>
			{confirmingReset && (
				<div className="settings-confirm" role="alertdialog" aria-modal="true">
					<strong>Reset all settings?</strong>
					<p>
						This restores Cognito preferences to their defaults. Your apps and
						pinned apps will not be changed.
					</p>
					<div>
						<button
							type="button"
							className="settings-secondary"
							onClick={() => setConfirmingReset(false)}
						>
							Cancel
						</button>
						<button type="button" className="settings-danger" onClick={reset}>
							Reset settings
						</button>
					</div>
				</div>
			)}
		</>
	);
}

function Appearance({ settings, update }) {
	return (
		<>
			<SectionCard title="Accent color">
				<div className="settings-accent-grid">
					{[
						"#007aff",
						"#5e5ce6",
						"#bf5af2",
						"#ff375f",
						"#ff9f0a",
						"#30d158",
						"#64d2ff",
					].map((color) => (
						<button
							key={color}
							type="button"
							aria-label={`Use ${color} accent`}
							className={`settings-accent${settings.accentColor === color ? " selected" : ""}`}
							style={{ background: color }}
							onClick={() => update({ accentColor: color })}
						/>
					))}
				</div>
			</SectionCard>
		</>
	);
}

function DockLauncher({ settings, update }) {
	return (
		<>
			<SectionCard title="Dock">
				<SettingRow
					label="Automatically hide and show"
					description="Reveal the Dock when you move to the bottom edge"
				>
					<Toggle
						label="Automatically hide and show Dock"
						checked={settings.dockAutoHide}
						onChange={(value) => update({ dockAutoHide: value })}
					/>
				</SettingRow>
				<SettingRow label="Magnification">
					<div className="settings-choice-grid compact">
						{[
							["off", "Off"],
							["standard", "Standard"],
							["large", "Large"],
						].map(([value, label]) => (
							<Choice
								key={value}
								value={value}
								current={settings.dockMagnification}
								label={label}
								onClick={(dockMagnification) => update({ dockMagnification })}
							/>
						))}
					</div>
				</SettingRow>
			</SectionCard>
			<SectionCard title="Launcher">
				<SettingRow
					label="Layout"
					description="Choose how applications are presented"
				>
					<div className="settings-choice-grid compact">
						<Choice
							value="grid"
							current={settings.launcherStyle}
							label="Grid"
							onClick={(launcherStyle) => update({ launcherStyle })}
						/>
						<Choice
							value="compact"
							current={settings.launcherStyle}
							label="Compact"
							onClick={(launcherStyle) => update({ launcherStyle })}
						/>
					</div>
				</SettingRow>
			</SectionCard>
		</>
	);
}

function BrowserSettings({ settings, update }) {
	return (
		<SectionCard title="Browsing">
			<SettingRow
				label="Search engine"
				description="Choose the search provider used for new searches"
			>
				<select
					className="settings-input"
					value={settings.searchProvider}
					onChange={(event) => update({ searchProvider: event.target.value })}
				>
					<option value="duckduckgo">DuckDuckGo</option>
					<option value="google">Google</option>
					<option value="yahoo">Yahoo</option>
					<option value="bing">Bing</option>
				</select>
			</SettingRow>
			<SettingRow
				label="Homepage"
				description="The page opened in new browser tabs"
			>
				<input
					className="settings-input"
					value={settings.homepage}
					onChange={(event) => update({ homepage: event.target.value })}
				/>
			</SettingRow>
		</SectionCard>
	);
}

function Privacy({ settings, update }) {
	const clearBrowsingData = useStore((s) => s.clearBrowsingData);
	const [confirming, setConfirming] = useState(false);
	const [cleared, setCleared] = useState(false);
	const clear = async () => {
		await clearBrowsingData();
		setConfirming(false);
		setCleared(true);
	};
	return (
		<>
			<SectionCard title="Stealth">
				<SettingRow
					label="About:blank cloaking"
					description="Try to reopen the Cognito shell in an about:blank popup"
				>
					<Toggle
						label="Allow notifications"
						checked={settings.aboutBlankCloaking}
						onChange={(aboutBlankCloaking) => update({ aboutBlankCloaking })}
					/>
				</SettingRow>
				<SettingRow
					label="Blob URL cloaking"
					description="Load the Cognito shell from a Blob-backed document URL"
				>
					<Toggle
						label="Do Not Disturb"
						checked={settings.blobUrlCloaking}
						onChange={(blobUrlCloaking) => update({ blobUrlCloaking })}
					/>
				</SettingRow>
				<p className="settings-muted">
					These modes conceal the shell URL only. External browser, proxy, and
					game URLs continue to load normally.
				</p>
			</SectionCard>
			<SectionCard title="Browser data">
				<SettingRow
					label="Clear browsing data"
					description="Remove cached site data and local storage"
				>
					<button
						type="button"
						className="settings-danger"
						onClick={() => setConfirming(true)}
					>
						Clear data
					</button>
				</SettingRow>
				{cleared && (
					<p className="settings-success">
						Browser data cleared. Your Cognito settings were kept.
					</p>
				)}
			</SectionCard>
			{confirming && (
				<div className="settings-confirm" role="alertdialog" aria-modal="true">
					<strong>Clear browser data?</strong>
					<p>
						This removes cached site data and local storage. Your apps, pins,
						and settings will remain.
					</p>
					<div>
						<button
							type="button"
							className="settings-secondary"
							onClick={() => setConfirming(false)}
						>
							Cancel
						</button>
						<button type="button" className="settings-danger" onClick={clear}>
							Clear data
						</button>
					</div>
				</div>
			)}
		</>
	);
}

function Network() {
	const status = useStore((s) => s.scramjetStatus);
	const labels = {
		unknown: "Not started",
		connecting: "Connecting",
		connected: "Connected",
		fallback: "Fallback mode",
		error: "Unavailable",
	};
	return (
		<SectionCard title="Connection">
			<SettingRow
				label="Scramjet proxy"
				description="Secure transport for web browsing"
			>
				<span className={`settings-status ${status}`}>
					{labels[status] || labels.unknown}
				</span>
			</SettingRow>
			<SettingRow label="Transport" description="Wisp via Libcurl">
				<span className="settings-muted">Built in</span>
			</SettingRow>
			<SettingRow label="Proxy configuration">
				<span className="settings-muted">Managed by Cognito</span>
			</SettingRow>
		</SectionCard>
	);
}

function Notifications({ settings, update }) {
	return (
		<SectionCard title="Notification preferences">
			<SettingRow
				label="Allow notifications"
				description="Show alerts in Notification Center"
			>
				<Toggle
					checked={settings.notificationsEnabled}
					onChange={(notificationsEnabled) => update({ notificationsEnabled })}
				/>
			</SettingRow>
			<SettingRow
				label="Do Not Disturb"
				description="Temporarily silence incoming notifications"
			>
				<Toggle
					checked={settings.doNotDisturb}
					onChange={(doNotDisturb) => update({ doNotDisturb })}
				/>
			</SettingRow>
		</SectionCard>
	);
}

function About() {
	return (
		<>
			<div className="settings-about-hero">
				<AppTile name="preferences-system" size={54} label="Settings" />
				<div>
					<h3>Cognito WebOS</h3>
					<p>Version 1.0.0</p>
				</div>
			</div>
			<SectionCard title="Information">
				<SettingRow label="Browser engine">
					<span className="settings-muted">Scramjet</span>
				</SettingRow>
				<SettingRow label="License">
					<span className="settings-muted">AGPL-3.0</span>
				</SettingRow>
				<SettingRow label="Attribution">
					<span className="settings-muted">Cognito contributors</span>
				</SettingRow>
			</SectionCard>
			<section className="about-mac-card" aria-label="About This Mac">
				<div className="about-mac-heading">
					<div className="about-mac-logo" aria-hidden="true">
						C
					</div>
					<div>
						<span className="about-mac-eyebrow">System information</span>
						<h3>About This Mac</h3>
					</div>
				</div>
				<div className="about-mac-specs">
					<div>
						<span>Product</span>
						<strong>Cognito WebOS</strong>
					</div>
					<div>
						<span>Version</span>
						<strong>1.0.0</strong>
					</div>
					<div>
						<span>Runtime</span>
						<strong>Web browser</strong>
					</div>
					<div>
						<span>Proxy engine</span>
						<strong>Scramjet</strong>
					</div>
				</div>
			</section>
		</>
	);
}

export default function Settings() {
	const settings = useStore((s) => s.settings);
	const updateSettings = useStore((s) => s.updateSettings);
	const [section, setSection] = useState("general");
	const current = SECTIONS.find(([id]) => id === section) || SECTIONS[0];
	const update = (patch) => updateSettings(patch);
	const content = {
		general: <General settings={settings} update={update} />,
		appearance: <Appearance settings={settings} update={update} />,
		dock: <DockLauncher settings={settings} update={update} />,
		browser: <BrowserSettings settings={settings} update={update} />,
		privacy: <Privacy settings={settings} update={update} />,
		network: <Network />,
		notifications: <Notifications settings={settings} update={update} />,
		about: <About />,
	}[section];

	return (
		<div className="settings-shell">
			<nav className="settings-sidebar" aria-label="Settings sections">
				<div className="settings-sidebar-heading">
					<AppTile name="preferences-system" size={30} label="Settings" />
					<span>Settings</span>
				</div>
				{SECTIONS.map(([id, label, icon]) => (
					<button
						key={id}
						type="button"
						className={id === section ? "active" : ""}
						onClick={() => setSection(id)}
					>
						<Icon name={icon} />
						{label}
					</button>
				))}
			</nav>
			<main className="settings-detail">
				<div className="settings-detail-heading">
					<span className="settings-kicker">System Preferences</span>
					<h1>{current[1]}</h1>
					<p>
						{section === "about"
							? "The open web desktop for everyday browsing."
							: "Customize how Cognito works for you."}
					</p>
				</div>
				{content}
			</main>
		</div>
	);
}
