export function makeLayerInteractive(map, layerId) {
	map.on('click', layerId, (e) => {
		const feature = e.features[0];
		// ------------------------------------------
		// Console Info
		// console.log(feature.geometry);

		// ------------------------------------------
		// Popup
		if (
			!!feature.properties.title ||
			!!feature.properties.description ||
			!!feature.properties.imageURL ||
			!!feature.properties.imageURL2
		) {
			const popup = new maplibregl.Popup({
				offset: 25,
				className: 'custom-popup',
				closeButton: false
			})
				.setLngLat(e.lngLat) // Set popup at the clicked location
				.setHTML(
					`
				<div class="absolute top-0 left-0 w-full h-[30px] bg-gradient-to-b from-white to-transparent pointer-events-none">
				</div>
				<h3 class="text-base font-bold text-gray-600 mb-2">${feature.properties.title || ''}</h3>
				<div class="pb-5 max-h-[50vh] w-full bg-white overflow-y-auto">
					${
						!!feature.properties.imageURL
							? `<img class="my-5 max-h-[30vh] mx-auto self-center max-w-full rotate-[1deg]" src="${feature.properties.imageURL}" alt="image"/>`
							: ''
					}
					<p class="text-xs">${feature.properties.description || ''}</p>
					${
						!!feature.properties.imageURL2
							? `<img class="my-5 max-h-[30vh] mx-auto self-center max-w-full rotate-[-2deg]" src="${feature.properties.imageURL2}" alt="image"/>`
							: ''
					}
					</div>
					<div class="absolute bottom-0 left-0 w-full h-[50px] bg-gradient-to-b from-transparent to-white pointer-events-none">
					</div>`
				)
				.addTo(map);
		}

		// ------------------------------------------
		// Center map on feature's coordinates
		var coords = e.features[0].geometry.coordinates;
		// workaround for features that are not points //! BETTER: evaluate center of all points
		while (coords[0].length > 1) {
			coords = coords[0];
		}
		// map.flyTo({
		// 	center: coords
		// });
	});

	map.on('mouseenter', layerId, () => {
		map.getCanvas().style.cursor = 'pointer';
	});

	map.on('mouseleave', layerId, () => {
		map.getCanvas().style.cursor = '';
	});
}
