import { TOGGLES, FEATURES } from '$lib/globals/FEATURES.svelte';
import { MAPPING } from '$lib/globals/MAPPING.svelte';

export function toggleAllOff(map) {
	//! CONSIDER just using toggleFeatures(map, 'all', 'false') instead of the procedure below (check for speed first)

	// Deactivate Toggles
	Object.keys(TOGGLES).forEach((key) => {
		TOGGLES[key].is_active = false;
	});

	if (map) {
		// Loop over subset of layers
		function toggleOff(layerId) {
			if (MAPPING.map.getLayer(layerId)) {
				var layer = map.getLayer(layerId);
				map.setLayoutProperty(layer.id, 'visibility', 'none');
			}
		}
		FEATURES.allLoaded_layerIds.forEach((layerId) => {
			toggleOff(layerId);
		});
		FEATURES.allLoadedPoints_layerIds.forEach((layerId) => {
			toggleOff(layerId);
		});
	}
}
