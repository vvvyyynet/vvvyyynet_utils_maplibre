import { MAPPING } from '$lib/globals/MAPPING.svelte';
import { basemapLayers } from '$lib/globals/TILES.svelte.js';

//----------------------------------------------
// Toggle between first two basemaps
export function toggleBasemap(force = 'toggle') {
	const IDs = Object.keys(basemapLayers).slice(0, 2); // get the first two
	// Guard: return if basemap-layers don't exist (yet)
	if (MAPPING.map.getLayer(IDs[0]) == null || MAPPING.map.getLayer(IDs[1]) == null) {
		console.warn('toggleBasemap aborted');
		return;
	}

	const old_ID = MAPPING.basemapId;
	switch (force) {
		case 'toggle':
			MAPPING.basemapId = MAPPING.basemapId == IDs[0] ? IDs[1] : IDs[0];
			break;
		case 'update':
			break;
	}
	const toggleforce = MAPPING.basemapId == IDs[0] ? 'false' : 'true';
	toggleBackgrounds(MAPPING.map, toggleforce);
	MAPPING.map.setLayoutProperty(old_ID, 'visibility', 'none');
	MAPPING.map.setLayoutProperty(MAPPING.basemapId, 'visibility', 'visible');
}
