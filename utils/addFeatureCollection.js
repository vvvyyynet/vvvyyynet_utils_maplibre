import { addFeature } from './addFeature';

export function addFeatureCollection(
	map,
	FeatColl,
	{
		idCollector = undefined,
		sortByTypesArray = false,
		id = undefined,
		id_prefix = undefined,
		collCallbacks = undefined,
		collStyleset = undefined,
		presetStyleset = undefined,
		featStylesetKey = 'style',
		groups = undefined,
		acceptTopLevelFeatureProps = undefined
	}
) {
	// Function Arguments
	// - map
	// - FeatColl: Object-Array (in geojson format) featureCollection
	// - (idCollector): Object-Array (default: undefined)
	// - (sortByTypesArray): falsy or Array of Strings (default: false) Must contain ['points', 'polygons', 'lines'] in the order of adding to map
	// - (id): string (default: undefined) Will be part of the sourceId and layerId
	// - (id_prefix): string (default: undefined) Prefix for the ids (e.g. "static", "database", ...)
	// - (collStyleset): Object-Array (default: undefined)
	// - (presetStyleset): Object-Array (default: undefined)
	// - (featStylesetKey): String (default: undefined)
	// - (groups): Array of Strings (default: undefined) Used for toggling/filtering
	// - (acceptTopLevelFeatureProps): boolean (default: undefined). If true, after searching for values in featStyleset it will also search in the first-level of feature.properties.
	//
	// Returns
	// - idCollector: Array

	// ==========================
	// Preparation
	// ==========================

	// Generate randomized fallback id
	if (!id) {
		id = String(Math.random()).slice(2);
	}

	// Generate sourceId
	const sourceId = [id_prefix, id].filter(Boolean).join('-');

	// ==========================
	// Add Source
	// ==========================
	// ! BEWARE: Only add a source, if id does not exist. Expect HMR errors, if you force re-adding!
	if (!map.getSource(sourceId)) {
		map.addSource(sourceId, {
			type: 'geojson',
			data: FeatColl
		});
	}

	// Sort Feature Collection by type
	if (sortByTypesArray) {
		if (
			sortByTypesArray.length === 3 &&
			sortByTypesArray.includes('points') &&
			sortByTypesArray.includes('lines') &&
			sortByTypesArray.includes('polygons')
		) {
			const FeatCollCat = FeatColl.features.reduce(
				(acc, feature) => {
					const featureType = feature.geometry.type;
					if (featureType === 'MultiPoint' || featureType === 'Point') {
						acc.points.push(feature);
					} else if (featureType === 'MultiLineString' || featureType === 'LineString') {
						acc.lines.push(feature);
					} else if (featureType === 'MultiPolygon' || featureType === 'Polygon') {
						acc.polygons.push(feature);
					}
					return acc;
				},
				{ points: [], lines: [], polygons: [] }
			);

			FeatColl.features = [
				...FeatCollCat[sortByTypesArray[0]],
				...FeatCollCat[sortByTypesArray[1]],
				...FeatCollCat[sortByTypesArray[2]]
			];
		} else {
			console.warn(
				`Invalid 'sortByTypesArray' detected.\n
				Expected:
				- Falsy
				- An array of length 3 containing exactly the values ['points', 'lines', 'polygons'], in any order.\n
				Found: ${sortByTypesArray}`
			);
		}
	}

	// ==========================
	// Add Layers
	// ==========================
	FeatColl.features.forEach((feature, index) => {
		const layerId = [id_prefix, id, index + 1].filter(Boolean).join('-');

		// -------------------------------------------
		// Add layer to map
		({ map: map, idCollector: idCollector } = addFeature(map, feature, sourceId, layerId, {
			groups,
			idCollector: idCollector,
			collCallbacks: collCallbacks,
			collStyleset: collStyleset,
			featStyleset: feature?.properties?.[featStylesetKey],
			presetStyleset: presetStyleset,
			acceptTopLevelFeatureProps: acceptTopLevelFeatureProps
		}));

	});

	return { map: map, idCollector: idCollector };
}
