import { addLayer } from './addLayer';
export function addFeatures(
	map,
	FeatColl,
	{
		sortByTypesArray = false, // falsy or array
		FEATURES = undefined,
		id = undefined,
		id_prefix = undefined,
		manualStyleset = undefined,
		defaultStyleset = undefined,
		groupNames = undefined,
		allowDirectAccess = undefined
	}
) {
	// Function Arguments
	// - map
	// - FeatColl: featureCollection (in geojson format)
	// - (id)
	// - (id_prefix): id_prefix for the ids (e.g. "static", "database", ...)
	// - (groupNames): used for toggling/filtering.
	// - (style): used for styling, can be contained in the geojson > properties > style.

	// Generate random default id
	if (!id) {
		id = String(Math.random()).slice(2);
	}

	// Generate sourceId
	const sourceId = id_prefix ? [id_prefix, id].join('-') : id;
	// Add Source if not exist (//! BEWARE: expect HMR errors, if you force readding!)
	if (!map.getSource(sourceId)) {
		map.addSource(sourceId, {
			type: 'geojson',
			data: FeatColl
		});
	}

	// Sort Feature Collection by type
	if (sortByTypesArray) {
		console.error('sortByTypesArray is not implemented yet.');
	}

	// Add Layers
	FeatColl.features.forEach((feature, index) => {
		const layerId = [id_prefix, id, index + 1].join('-');
		const featureStyleset = feature.properties.style;
		addLayer(
			map,
			feature,
			FEATURES,
			sourceId,
			layerId,
			featureStyleset,
			manualStyleset,
			groupNames,
			{
				defaultStyleset: defaultStyleset,
				allowDirectAccess: allowDirectAccess
			}
		);
	});
}
