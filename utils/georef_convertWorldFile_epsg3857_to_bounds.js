export function georef_convertWorldFile_epsg3857_to_bounds(imgdims, worldfile) {
	// Image dimensions (replace with actual width and height of your image)
	const imageWidth = imgdims[0]; // Width of your image in pixels
	const imageHeight = imgdims[1]; // Height of your image in pixels

	// World file values (example values; replace with actual ones from your world file)
	const pixelSizeX = worldfile[0]; // From world file (line 1)
	const pixelSizeY = worldfile[1]; // From world file (line 4)
	const topLeftX = worldfile[2]; // From world file (line 5)
	const topLeftY = worldfile[3]; // From world file (line 6)
	const rotationX = worldfile[4];
	const rotationY = worldfile[5];

	// Calculate the top-right corner in EPSG:3857
	const topRightX = topLeftX + pixelSizeX * imageWidth + rotationX * imageHeight; // Adding rotation effect
	const topRightY = topLeftY + rotationY * imageHeight; // Adding rotation effect

	// Calculate the bottom-left corner in EPSG:3857
	const bottomLeftX = topLeftX + rotationX * imageWidth; // Adding rotation effect
	const bottomLeftY = topLeftY + pixelSizeY * imageHeight + rotationY * imageWidth; // Adding rotation effect

	// Calculate the bottom-right corner in EPSG:3857
	const bottomRightX = topLeftX + pixelSizeX * imageWidth + rotationX * imageHeight; // Adding rotation effect
	const bottomRightY = topLeftY + pixelSizeY * imageHeight + rotationY * imageWidth; // Adding rotation effect

	// Function to convert EPSG:3857 coordinates to EPSG:4326
	function epsg3857To4326(x, y) {
		const metersPerDegree = 20037508.34; // Earth radius in meters for Web Mercator (EPSG:3857)

		// Convert x (in meters) to longitude
		const lon = (x / metersPerDegree) * 180;

		// Convert y (in meters) to latitude
		let lat = (y / metersPerDegree) * 180;
		lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);

		return [lon, lat];
	}
	// Convert all four corners to EPSG:4326
	const topLeft = epsg3857To4326(topLeftX, topLeftY);
	const topRight = epsg3857To4326(topRightX, topRightY);
	const bottomLeft = epsg3857To4326(bottomLeftX, bottomLeftY);
	const bottomRight = epsg3857To4326(bottomRightX, bottomRightY);

	// Ensure the order is: top-left, top-right, bottom-right, bottom-left
	const bounds = [topLeft, topRight, bottomRight, bottomLeft];
	return bounds;
}
