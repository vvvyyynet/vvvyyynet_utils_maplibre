export function georef_convertWorldFile_to_bounds(imgdims, worldfile) {
	// Image dimensions (replace with actual width and height of your image)
	const imageWidth = imgdims[0]; // Width of your image in pixels
	const imageHeight = imgdims[1]; // Height of your image in pixels

	// World file values (example values; replace with actual ones from your world file)
	const pixelSizeX = worldfile[0]; // From world file (line 1)
	const pixelSizeY = worldfile[1]; // From world file (line 4)
	const topLeftX = worldfile[2]; // From world file (line 5)
	const topLeftY = worldfile[3]; // From world file (line 6)

	// Calculate the bounds (coordinates of the four corners)
	const topLeft = [topLeftX, topLeftY]; // Top-left corner (world file gives this)
	const topRight = [topLeftX + imageWidth * pixelSizeX, topLeftY]; // Top-right corner
	const bottomLeft = [topLeftX, topLeftY + imageHeight * pixelSizeY]; // Bottom-left corner
	const bottomRight = [topRight[0], bottomLeft[1]]; // Bottom-right corner

	const bounds = [topLeft, topRight, bottomRight, bottomLeft];
	return bounds;
}
