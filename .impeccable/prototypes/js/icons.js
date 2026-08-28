/* Inline stroke icons — one weight, no emoji. */
window.Icons = {
	svg(name, size = 20) {
		const d = this.paths[name] || this.paths.circle
		return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
	},
	paths: {
		overview: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
		upcoming: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
		projects: '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
		labels: '<path d="M20.6 13.4 12.1 21.9a2 2 0 0 1-2.8 0L2 14.7V2h12.7l8 8a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
		teams: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
		inbox: '<path d="M22 12h-6l-2 3H10l-2-3H2"/><path d="M5.5 8 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-4"/>',
		house: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/>',
		briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20"/>',
		cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>',
		heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1 7.7 7.8 7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
		wallet: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20M16 14h.01"/>',
		bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
		book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
		map: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
		archive: '<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>',
		plus: '<path d="M12 5v14M5 12h14"/>',
		check: '<path d="M20 6 9 17l-5-5"/>',
		chevron: '<path d="m9 18 6-6-6-6"/>',
		pin: '<path d="M12 17v5M9 10.8V4h6v6.8L19 15H5l4-4.2z"/>',
		close: '<path d="M18 6 6 18M6 6l12 12"/>',
		list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
		kanban: '<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="10" rx="1"/><rect x="17" y="4" width="5" height="13" rx="1"/>',
		star: '<path d="m12 2 2.9 6.9L22 10l-5 4.4 1.5 7L12 17.8 5.5 21.4 7 14.4 2 10l7.1-1.1z"/>',
		circle: '<circle cx="12" cy="12" r="9"/>',
		home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/>',
		back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
		menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
		grip: '<path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"/>',
	},
}
