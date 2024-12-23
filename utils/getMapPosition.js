//----------------------------------------------
// Get Map Position
export function getMapPosition(map) {
	const center = map.getCenter(); // { lng: <longitude>, lat: <latitude> }
	const zoom = map.getZoom(); // Current zoom level
	const bearing = map.getBearing(); // Current bearing (rotation in degrees)
	const pitch = map.getPitch(); // Current pitch (tilt in degrees)

	console.log(
		`Current Map Perspective: [${center.lng}, ${center.lat}], ${zoom}, ${bearing}, ${pitch}]`
	);
}
