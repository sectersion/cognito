import { Component } from "react";

export default class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	componentDidCatch(error, errorInfo) {
		console.error("ErrorBoundary caught:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			const fallback = this.props.fallback;
			if (fallback) return fallback;
			return (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
						gap: 8,
						padding: 24,
						color: "rgba(255,255,255,0.72)",
						textAlign: "center",
						fontSize: 13,
					}}
				>
					<strong>Something went wrong</strong>
					<span
						style={{
							maxWidth: 440,
							color: "rgba(255,255,255,0.4)",
							fontSize: 12,
						}}
					>
						{this.state.error?.message || "An unexpected error occurred"}
					</span>
					<button
						onClick={() => this.setState({ hasError: false, error: null })}
						style={{
							marginTop: 8,
							padding: "6px 12px",
							background: "rgba(255,255,255,0.1)",
							border: "1px solid rgba(255,255,255,0.15)",
							borderRadius: 6,
							color: "white",
							cursor: "pointer",
							fontSize: 12,
						}}
					>
						Try again
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}
