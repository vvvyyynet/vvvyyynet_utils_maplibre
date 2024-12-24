import { create_SourceId_from_LayerId } from './create_sourceId_from_layerId';
import { MAPPING } from '$lib/globals/MAPPING.svelte';

export function georef_addToMap(layerId, url, bounds, visible = false, opacity = 1) {
	// sourceId similar to layerId //! Document this //! TODO outsource in some conventions yaml
	const sourceId = create_SourceId_from_LayerId(layerId);

	// console.log('Adding: ', layerId);

	// Add to Source and Map
	if (!!!MAPPING.map.getSource(sourceId)) {
		// console.log('CREATING SOURCE: ', sourceId);
		MAPPING.map.addSource(sourceId, {
			type: 'image',
			url: url,
			coordinates: bounds
		});
	}

	// Add a raster layer to display the image
	if (!!MAPPING.map.getLayer(layerId)) {
		MAPPING.map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
	} else {
		// console.log('CREATING LAYER: ', layerId);
		MAPPING.map.addLayer({
			id: layerId,
			type: 'raster',
			source: sourceId,
			layout: {
				visibility: visible ? 'visible' : 'none' // Hidden by default
			},
			paint: {
				'raster-opacity': opacity // Initialize with default opacity
			}
		});
	}
}
