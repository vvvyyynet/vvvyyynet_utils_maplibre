// Load an SVG image and register it as a pattern
export function registerSVG(map, id, url) {
	const img = new Image();
	img.src = url;

	img.onload = () => {
		// Convert the SVG image to a bitmap for WebGL compatibility
		createImageBitmap(img)
			.then((imageBitmap) => {
				map.addImage(id, imageBitmap);
			})
			.catch((error) => {
				console.error('Error creating image bitmap:', error);
			});
	};
}
