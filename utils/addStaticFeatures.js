import {addFeatures} from './addFeatures'

// Add Static Features
export function addStaticFeatures(map, staticURLs) {
	// Loop through all staticURLs
	staticURLs.forEach(async (staticURL) => {
		// Fetch geoJSON from static URL
		try {
			const FeatColl_geojson = await fetch(staticURL);
			const FeatColl = await FeatColl_geojson.json();
			const groupNames = FeatColl.features[0].metadata?.groupNames || undefined;
			addFeatures(map, FeatColl, {id: FeatColl.properties.id, prefix: 'static', groupNames: groupNames, style: FeatColl.properties.style}); 
		} catch (error) {
			console.warn(error);
		}
	});
}
