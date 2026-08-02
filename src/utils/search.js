const SEARCH_URLS = {
	duckduckgo: "https://duckduckgo.com/?q=%s",
	google: "https://www.google.com/search?q=%s",
	yahoo: "https://search.yahoo.com/search?p=%s",
	bing: "https://www.bing.com/search?q=%s",
};

export function search(input, provider = "duckduckgo") {
	try {
		return new URL(input).toString();
	} catch {} // eslint-disable-line no-empty
	try {
		const url = new URL(`http://${input}`);
		if (url.hostname.includes(".")) return url.toString();
	} catch {} // eslint-disable-line no-empty
	return (SEARCH_URLS[provider] || SEARCH_URLS.duckduckgo).replace(
		"%s",
		encodeURIComponent(input)
	);
}
