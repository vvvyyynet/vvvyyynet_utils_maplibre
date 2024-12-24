import { georef_calculate_bounds } from './georefCalculateBounds';
import { georef_addToMap } from './georef_addToMap';
import { GEOREF_TOGGLES } from '$lib/globals/FEATURES.svelte';

export function addGeoref(georef_id, georef_baseURL) {
	//!TODO this function is still duplicated in some tours.
	// Calculate bounds and add to map
	georef_calculate_bounds(`${georef_baseURL}.png`, `${georef_baseURL}.pgw`).then((bounds) => {
		georef_addToMap(
			georef_id,
			`${georef_baseURL}.png`,
			bounds,
			GEOREF_TOGGLES[georef_id].is_active
		);
	});
}
