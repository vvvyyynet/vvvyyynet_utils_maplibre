import { TOGGLES, FEATURES } from '$lib/globals/FEATURES.svelte';
import { MAPPING } from '$lib/globals/MAPPING.svelte';

export function toggleFeature(map, key, force = 'toggle') {
	if (typeof document === 'undefined') return null; // Don't run if SSR

	// toggle all
	if (key == 'all') {
		// Separate keys by `is_active`
		const inactiveKeys = Object.keys(TOGGLES).filter((key) => TOGGLES[key].is_active === false);
		const activeKeys = Object.keys(TOGGLES).filter((key) => TOGGLES[key].is_active === true);

		// first switch off all invisible and then switch on all visible (important, if features appear in multiple groups!)
		[...inactiveKeys, ...activeKeys].forEach((key) => {
			toggleFeature(map, key, force);
		});
		return;
	}

	// test key
	if (!TOGGLES[key]) {
		console.warn(`could not toggle key: "${key}`);
		return;
	}
	// update TOGGLES
	switch (force) {
		case 'toggle':
			TOGGLES[key].is_active = TOGGLES[key].is_active ? false : true;
			break;
		case 'true':
			TOGGLES[key].is_active = true;
			break;
		case 'false':
			TOGGLES[key].is_active = false;
			break;
		case 'update': // used for updating background visibility
			break;
	}

	// toggle button active state
	const el = document.querySelector('#toggle-' + key);
	if (el) {
		if (TOGGLES[key].is_active) el.classList.add('active');
		else el.classList.remove('active');
	}

	// toggle the features visibility
	if (map) {
		// Array.from(TOGGLES[key].groupNames).forEach((groupName) => {
		// Loop over subset of layers
		function toggle_layers(layerId, is_visible) {
			var layer = map.getLayer(layerId);
			if (
				layer &&
				layer.metadata &&
				layer.metadata.groupNames &&
				layer.metadata.groupNames.includes(key)
			) {
				map.setLayoutProperty(layer.id, 'visibility', is_visible ? 'visible' : 'none');
				if (is_visible) {
					map.moveLayer(layer.id); // move to top
					//! UGLY WORKAROUND to make sure that icon-backgrounds don't move front without their icons
					if (layer.id.endsWith('-background')) {
						const plain_id = layer.id.slice(0, -'-background'.length);
						map.moveLayer(plain_id);
					}
				}
			}
		}
		FEATURES.allLoaded_layerIds.forEach((layerId) => {
			toggle_layers(layerId, TOGGLES[key].is_active);
		});
		FEATURES.allLoadedPoints_layerIds.forEach((layerId) => {
			toggle_layers(layerId, TOGGLES[key].is_active && MAPPING.hasBackground);
		});
		// });
	}
}
