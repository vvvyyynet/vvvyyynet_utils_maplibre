import { georef_convertWorldFile_epsg3857_to_bounds } from './georef_convertWorldFile_epsg3857_to_bounds';
export async function georef_calculate_bounds(imageSrc, worldfileSrc) {
	// Function to read the worldfile (filename.pgw)
	async function readWorldFile(file) {
		try {
			const response = await fetch(file);
			const text = await response.text();
			const lines = text.trim().split('\n').map(Number);

			return {
				A: lines[0], // pixel size in the x-direction (map units per pixel)
				D: lines[1], // rotation term (usually 0 if the image is North-oriented)
				B: lines[2], // rotation term (usually 0 if the image is North-oriented)
				E: lines[3], // pixel size in the y-direction (map units per pixel, typically negative)
				topLeftX: lines[4], // x-coordinate of the center of the top-left pixel
				topLeftY: lines[5] // y-coordinate of the center of the top-left pixel
			};
		} catch (error) {
			console.error('Error reading worldfile:', error);
			throw error;
		}
	}

	// Read image dimensions
	async function getImageDimensions(imgSrc) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				resolve({
					width: img.naturalWidth,
					height: img.naturalHeight
				});
			};
			img.onerror = (error) => {
				console.error('Error loading image:', error, imgSrc, img);
				reject(error);
			};
			img.src = imgSrc;
		});
	}

	// Read worldfile and image dimensions asynchronously
	const wf = await readWorldFile(worldfileSrc);
	const imgdims = await getImageDimensions(imageSrc);

	// console.log('Worldfile data:', wf);
	// console.log('Image dimensions:', imgdims);

	// return
	const bounds = georef_convertWorldFile_epsg3857_to_bounds(
		[imgdims.width, imgdims.height],
		[wf.A, wf.E, wf.topLeftX, wf.topLeftY, wf.D, wf.B]
	);
	// console.log(bounds);

	return bounds;
}
