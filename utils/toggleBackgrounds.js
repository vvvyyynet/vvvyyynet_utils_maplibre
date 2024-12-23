import { MAPPING } from '$lib/globals/MAPPING.svelte';

export function toggleBackgrounds(map, force = 'toggle') {
	switch (force) {
		case 'toggle':
			MAPPING.hasBackground = !MAPPING.hasBackground;
			break;
		case 'true':
			MAPPING.hasBackground = true;
			break;
		case 'false':
			MAPPING.hasBackground = false;
			break;
	}

	if (map) {
		toggleFeature(map, 'all', 'update');
	}
}
