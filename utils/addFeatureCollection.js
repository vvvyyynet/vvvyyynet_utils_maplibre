import { addFeature } from './addFeature';

export function addFeatureCollection(
	map,
	FeatColl,
	{
		idCollector = undefined,
		sortByTypesArray = false, // falsy or array
		id = undefined,
		id_prefix = undefined,
		manualStyleset = undefined,
		defaultStyleset = undefined,
		groups = undefined,
		allowDirectAccess = undefined
	}
) {
	// Function Arguments
	// - map
	// - FeatColl: featureCollection (in geojson format)
	// - (id)
	// - (id_prefix): id_prefix for the ids (e.g. "static", "database", ...)
	// - (groups): used for toggling/filtering.
	// - (style): used for styling, can be contained in the geojson > properties > style.

	// Generate randomized fallback id
	if (!id) {
		id = String(Math.random()).slice(2);
	}

	// Generate sourceId
	const sourceId = [id_prefix, id].filter(Boolean).join('-');
	
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
		const layerId = [id_prefix, id, index + 1].filter(Boolean).join('-');
		const featureStyleset = feature.properties.style;
		({map:map, idCollector:idCollector} = addFeature(
			map,
			feature,
			sourceId,
			layerId,
			featureStyleset,
			manualStyleset,
			groups,
			{
				idCollector: idCollector,
				defaultStyleset: defaultStyleset,
				allowDirectAccess: allowDirectAccess
			}
		));
	});

	return {map: map, idCollector:idCollector};
}
