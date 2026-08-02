import { useEffect, useRef, useState } from "react";

export function useContextMenu() {
	const [menu, setMenu] = useState(null);

	useEffect(() => {
		const close = () => setMenu(null);
		const onKeyDown = (event) => {
			if (event.key === "Escape") close();
		};
		document.addEventListener("mousedown", close);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("mousedown", close);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, []);

	return {
		menu,
		openMenu: (event, data) => {
			event.preventDefault();
			event.stopPropagation();
			setMenu({ x: event.clientX, y: event.clientY, ...data });
		},
		closeMenu: () => setMenu(null),
	};
}

export default function ContextMenu({ x, y, items, onClose }) {
	const menuRef = useRef(null);

	useEffect(() => {
		const menu = menuRef.current;
		if (!menu) return;
		menu.querySelector("button:not([disabled])")?.focus();
		const rect = menu.getBoundingClientRect();
		menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - rect.width - 8))}px`;
		menu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - rect.height - 8))}px`;
	}, [x, y]);

	return (
		<div
			ref={menuRef}
			className="context-menu glass"
			role="menu"
			tabIndex={-1}
			style={{ left: x, top: y }}
			onMouseDown={(event) => event.stopPropagation()}
		>
			{items.map((item, index) =>
				item.separator ? (
					<div key={`separator-${index}`} className="context-menu-separator" />
				) : (
					<button
						key={item.label}
						type="button"
						role="menuitem"
						disabled={item.disabled}
						onClick={() => {
							item.onSelect?.();
							onClose();
						}}
					>
						<span>{item.label}</span>
						{item.shortcut && <small>{item.shortcut}</small>}
					</button>
				)
			)}
		</div>
	);
}
