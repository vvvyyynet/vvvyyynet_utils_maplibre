// Load Images (and scaling)
export async function registerPNG(map, id, url, repeat = false) {
	if (!map.getImage(id)) {
		const image = await map.loadImage(url);
		map.addImage(id, image.data, { repeat: repeat });
	}
}
