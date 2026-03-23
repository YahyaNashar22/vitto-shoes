export function reveal(node: HTMLElement) {
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.dataset.visible = 'true';
					observer.disconnect();
				}
			}
		},
		{ threshold: 0.18 }
	);

	node.dataset.visible = 'false';
	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
