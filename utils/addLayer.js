import maplibregl from 'maplibre-gl';

//////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions
//////////////////////////////////////////////////////////////////////////////////////////
function getFromStyle(style, name) {
	//! BEWARE: what was this undefined-replacement for? (before it was even more explicit, replacing undefined with null)
	// may have to do sth with maplibregl erroring out on undefined... I had this but could not reproduce.
	return (style[name] = style[name] ?? null); // replace undefined with null
}

function getDash(feature, style) {
	return feature.properties.is_dashed || style.is_dashed ? [1, 1] : [1, 0];
}

function makeLayerInteractive(map, layerId) {
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

//////////////////////////////////////////////////////////////////////////////////////////
// Add Layer
//////////////////////////////////////////////////////////////////////////////////////////
export function addLayer(
	map,
	FEATURES,
	feature,
	sourceId,
	layerId,
	style = {},
	groupNames = [],
	linesStyle = {
		hasGlow: false
	},
	pointsStyle = {
		type: 'circle', // 'icon' || 'circle'
		setInvisible: false,
		circleStyle: {
			circleRadius: undefined,
			circleColor: undefined,
			circleStrokeColor: undefined,
			circleStrokeWidth: undefined
		},
		iconStyle: {
			hasIconBackdrop: false,
			forcedIconName: undefined,
			fallbackIconName: undefined,
			//! BEWARE: currently, fallbackIconName only jumps in if no other iconName is provided, but it will not render in case of a type, e.g. in forcedIconName
			iconBackdropStyle: {
				setInvisible: false,
				circleRadius: undefined,
				circleColor: undefined,
				circleStrokeColor: undefined,
				circleStrokeWidth: undefined
			}
		}
	}
) {
	// ---------------------------------------------------------------------------------------
	// CHECKS

	// Test for missing id
	if (!layerId) {
		console.warn('missing layerId detected: ', feature);
		return;
	}

	// Test for duplicate layers
	if (map.getLayer(layerId)) {
		console.warn('duplicate layerId detected: ', layerId, feature);
		return;
	}
	// Test for nullis features
	if (!feature) {
		console.warn('nullish feature detected : ', layerId, feature);
		return;
	}

	// ---------------------------------------------------------------------------------------
	// ADD LAYER
	const featureType = feature.geometry ? feature.geometry.type : undefined;

	// --------------------------------------
	// Points
	// --------------------------------------
	if (featureType === 'MultiPoint' || featureType === 'Point') {
		pointsStyle.type = pointsStyle?.type ?? 'circle'; // fallback
		switch (pointsStyle.type) {
			// Add simple circles
			case 'circle':
				map.addLayer({
					id: layerId,
					type: 'circle',
					source: sourceId,
					layout: {
						visibility: pointsStyle?.setInvisible ? 'none' : 'visible'
					},
					paint: {
						'circle-radius': pointsStyle?.circleStyle?.circleRadius || 10,
						'circle-color': pointsStyle?.circleStyle?.circleColor || 'red',
						'circle-stroke-color': pointsStyle?.circleStyle?.circleStrokeColor || 'black',
						'circle-stroke-width': pointsStyle?.circleStyle?.circleStrokeWidth || 1
					}
					// filter: ['==', ['get', 'id'], feature.properties.id]
				});
				break;
			case 'icon':
				// Add backdrop circle
				if (pointsStyle?.iconStyle?.hasIconBackdrop) {
					map.addLayer({
						id: `${layerId}-background`,
						type: 'circle',
						source: sourceId,
						metadata: {
							groupNames: groupNames
						},
						layout: {
							visibility: pointsStyle?.iconStyle?.iconBackdropStyle?.setInvisible
								? 'none'
								: 'visible'
						},
						paint: {
							'circle-radius': pointsStyle?.iconStyle?.iconBackdropStyle?.circleRadius || 18,
							'circle-color': pointsStyle?.iconStyle?.iconBackdropStyle?.circleColor || 'white',
							'circle-stroke-color':
								pointsStyle?.iconStyle?.iconBackdropStyle?.circleStrokeColor || '#000000',
							'circle-stroke-width':
								pointsStyle?.iconStyle?.iconBackdropStyle?.circleStrokeWidth || 1
						}
						// filter: ['==', ['get', 'id'], feature.properties.id]
					});
				}

				// Add custom icon
				map.addLayer({
					id: layerId,
					type: 'symbol',
					source: sourceId,
					metadata: {
						groupNames: groupNames
					},
					layout: {
						visibility: pointsStyle?.setInvisible ? 'none' : 'visible',
						'icon-image': pointsStyle?.iconStyle?.forcedIconName || [
							'coalesce',
							['get', 'iconName'],
							getFromStyle(style, 'iconName') || pointsStyle?.iconStyle?.fallbackIconName
						], // Note: icons must be added to map
						'icon-size': ['coalesce', ['get', 'iconSize'], getFromStyle(style, 'iconSize') || 0.02],
						'icon-anchor': 'center',
						'icon-overlap': 'cooperative',
						'text-field': ['get', 'comment'],
						'text-offset': [0, 1.25],
						'text-anchor': 'top'
						// 'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
					}
					// filter: ['==', ['get', 'id'], feature.properties.id]
				});
				break;
		}

		FEATURES.allLoaded_layerIds.push(layerId);
		FEATURES.allLoadedPoints_layerIds.push(`${layerId}-background`);
		FEATURES.allLoadedPoints_Ids.push({
			source: sourceId,
			id: layerId
		});

		// --------------------------------------
		// Lines
		// --------------------------------------
	} else if (featureType === 'MultiLineString' || featureType === 'LineString') {
		function addLine(id, hasGlow = false) {
			const lineWidthFactor = hasGlow ? 2.5 : 1; //!DEBUG may not work with linewidth from style!
			const lineBlur = hasGlow ? 14 : 0;

			map.addLayer({
				id: id,
				type: 'line',
				source: sourceId,
				metadata: {
					groupNames: groupNames
				},
				layout: {
					visibility: 'none' // Hidden by default
					// 'line-join': 'round',
					// 'line-cap': 'round'
				},
				paint: {
					'line-color': [
						'coalesce',
						['get', 'lineColor'],
						getFromStyle(style, 'lineColor') || 'green'
					],
					'line-width': getFromStyle(style, 'lineWidth') || [
						'interpolate',
						['linear'],
						['zoom'],
						0,
						2 * lineWidthFactor,
						16,
						5 * lineWidthFactor
					],
					'line-opacity': getFromStyle(style, 'lineOpacity') || 1,
					'line-blur': lineBlur,
					'line-dasharray': getDash(feature, style)
				}
				// filter: ['==', ['get', 'id'], feature.properties.id]
			});
			// make sure glow is not dashed
			if (linesStyle?.hasGlow) {
				map.setPaintProperty(id, 'line-dasharray', null);
			}
		}
		// add with glow
		addLine(layerId, false);
		FEATURES.allLoaded_layerIds.push(layerId);
		if (linesStyle?.hasGlow) {
			const glow_id = `${layerId}-glow`;
			addLine(glow_id, true);
			FEATURES.allLoaded_layerIds.push(glow_id);
		}

		// --------------------------------------
		// Polygons
		// --------------------------------------
	} else if (featureType === 'MultiPolygon' || featureType === 'Polygon') {
		const layerIdContour = layerId + '-contour';
		map.addLayer({
			id: layerId,
			type: 'fill',
			source: sourceId,
			metadata: {
				groupNames: groupNames
			},
			layout: {
				visibility: 'none' // Hidden by default
			},
			paint: {
				'fill-color': [
					'coalesce',
					['get', 'fillColor'],
					getFromStyle(style, 'fillColor') || 'yellow'
				],
				'fill-pattern': 'red-striped-pattern',
				'fill-opacity': 0.5,
				'fill-antialias': true // to on the safe side
			},
			// filter: ['==', ['get', 'id'], feature.properties.id]
			maxzoom: 20 // Adjust this depending on your use case
		});
		map.addLayer({
			id: layerIdContour,
			type: 'line',
			source: sourceId,
			metadata: {
				groupNames: groupNames
			},
			layout: {
				visibility: 'none' // Hidden by default
			},
			paint: {
				'line-color': [
					'coalesce',
					['get', 'lineColor'],
					getFromStyle(style, 'lineColor') || 'darkblue'
				],
				'line-width': [
					'interpolate',
					['linear'],
					['zoom'], // followed by zoom-level, thickness, zoom-level, thickness, ...
					8,
					0.1,
					15,
					6
				],
				'line-opacity': 1
			}
			// filter: ['==', ['get', 'id'], feature.properties.id]
		});
		FEATURES.allLoaded_layerIds.push(layerId);
		FEATURES.allLoaded_layerIds.push(layerIdContour);

		// --------------------------------------
		// Circles
		// --------------------------------------
	} else if (feature.properties.shape === 'Circle' && feature.properties.radius) {
		// Add circle as Point layer styled as a circle
		map.addLayer({
			id: layerId,
			type: 'circle',
			source: sourceId,
			metadata: {
				groupNames: groupNames
			},
			paint: {
				'circle-radius': feature.properties.radius,
				'circle-color': style.color || '#f30',
				'circle-opacity': 0.5
			},
			layout: {
				visibility: 'none' // Hidden by default
			}
			// filter: ['==', ['get', 'id'], feature.properties.id]
		});
		FEATURES.allLoaded_layerIds.push(layerId);
	}

	// -------------------------------------------
	// Make layer interactive
	makeLayerInteractive(map, layerId);
}
