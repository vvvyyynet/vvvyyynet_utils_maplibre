import { GEOREF_TOGGLES } from '$lib/globals/FEATURES.svelte';
import { MAPPING } from '$lib/globals/MAPPING.svelte';

export function toggleGeoref(map, key, force = 'toggle', exception = '') {
	if (typeof document === 'undefined') return null; // Don't run if SSR

	// Guard: handle array-input by recalling own function
	// --> use the exception prop for propper toggling! //! Document this
	if (typeof key === 'object') {
		key.forEach((el) => {
			if (el !== exception) toggleGeoref(map, el, force);
		});
		return null;
	}

	// Change visibility
	if (MAPPING.map.getLayer(key)) {
		switch (force) {
			case 'toggle':
				GEOREF_TOGGLES[key].is_active = !GEOREF_TOGGLES[key].is_active;
				MAPPING.map.setLayoutProperty(
					key,
					'visibility',
					GEOREF_TOGGLES[key].is_active ? 'visible' : 'none'
				);
				break;
			case 'true':
				GEOREF_TOGGLES[key].is_active = true;
				MAPPING.map.setLayoutProperty(key, 'visibility', 'visible');
				break;
			case 'false':
				GEOREF_TOGGLES[key].is_active = false;
				MAPPING.map.setLayoutProperty(key, 'visibility', 'none');
				break;
			default:
				GEOREF_TOGGLES[key].is_active = !GEOREF_TOGGLES[key].is_active;
				MAPPING.map.setLayoutProperty(
					key,
					'visibility',
					GEOREF_TOGGLES[key].is_active ? 'visible' : 'none'
				);
		}
	} else {
		console.warn('layer does not exist');
	}
}
