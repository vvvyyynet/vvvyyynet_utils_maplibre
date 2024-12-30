import { addFeatureCollection } from './addFeatureCollection';

// Add Static Features
export function addStaticFeatures(map, staticURLs) {
	// Loop through all staticURLs
	staticURLs.forEach(async (staticURL) => {
		// Fetch geoJSON from static URL
		try {
			const FeatColl_geojson = await fetch(staticURL);
			const FeatColl = await FeatColl_geojson.json();

			addFeatureCollection(map, FeatColl, {
				idCollector: undefined,
				sortByTypesArray: undefined,
				id: FeatColl.properties.id,
				id_prefix: 'static',
				manualStyleset: undefined,
				defaultStyleset: undefined,
				groups: FeatColl.features[0].metadata?.groups || undefined,
				allowDirectAccess: undefined
			});
		} catch (error) {
			console.warn(error);
		}
	});
}
