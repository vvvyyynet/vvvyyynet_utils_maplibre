import { MAPPING } from '$lib/globals/MAPPING.svelte';

export function georef_removeFromMap(layerId, includeSource = false) {
	// Guard: handle array-input by recalling own function
	if (typeof layerId === 'object') {
		layerId.forEach((el) => {
			georef_removeFromMap(el, includeSource);
		});
	}

	// console.log('REMOVING: ', layerId);

	// Remove layer
	if (!!MAPPING.map.getLayer(layerId)) {
		MAPPING.map.removeLayer(layerId);
		// console.log('successfully removed :', layerId);
	}
	// Remove source
	if (includeSource) {
		const sourceId = create_SourceId_from_LayerId(layerId);
		if (!!MAPPING.map.getSource(sourceId)) {
			MAPPING.map.removeSource(sourceId);
		}
	}
}
