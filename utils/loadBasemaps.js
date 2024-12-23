import { MAPPING } from '$lib/globals/MAPPING.svelte';
import { basemapLayers } from '$lib/globals/TILES.svelte.js';

//----------------------------------------------
// Load Basemaps
export function loadBasemaps(IDs) {
	// Add first two basemaps as layers
	IDs.forEach((id) => {
		if (!!!MAPPING.map.getLayer(id)) {
			MAPPING.map.addSource(`${id}-source`, basemapLayers[id].source);
			MAPPING.map.addLayer({
				id: id,
				type: basemapLayers[id].type,
				source: `${id}-source`,
				layout: { visibility: 'visible' }
			});
		}
		// move behind all other (maybe already existing) layers
		if (MAPPING.map.getStyle().layers.length > 0) {
			MAPPING.map.moveLayer(id, MAPPING.map.getStyle().layers[0].id);
		}
		// make invisible
		MAPPING.map.setLayoutProperty(id, 'visibility', 'none');
	});
	// make current basemap-layer visible
	MAPPING.map.setLayoutProperty(MAPPING.basemapId, 'visibility', 'visible');
}
