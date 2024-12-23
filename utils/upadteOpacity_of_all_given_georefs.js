import { MAPPING } from '$lib/globals/MAPPING.svelte';

// Update the layer's opacity dynamically when the slider changes
export function updateOpacity_allgiven_georef(event, keys) {
	// assumes that opacity is in range [0,1]
	const opacity = Number(event.target.value);
	if (keys && keys.length > 0) {
		keys.forEach((key) => {
			MAPPING.map.setPaintProperty(key, 'raster-opacity', opacity);
		});
	}
}
