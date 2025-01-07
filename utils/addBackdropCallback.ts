import { setNested } from './general_utils';

function tweakBackdropStyle(styleset, type, pathSuffix) {
	// All replacements will happen on a styleset level.
	// Input: type = 'lines' or 'polygons'

	// ----------------------
	// minzoom and maxzoom
	// ----------------------
	// If backdrop.minzoom (backdrop.maxzoom) is unset, make sure it has the same value as the regular line.
	if (styleset?.[type] && !styleset?.[type]?.backdrop?.minzoom) {
		//!! (testing for styleset?.[type]) is important, if styleset={})
		setNested(styleset?.[type], `${pathSuffix}.minzoom`, styleset?.[type]?.minzoom);
	}
	if (styleset?.[type] && !styleset?.[type]?.backdrop?.maxzoom) {
		setNested(styleset?.[type], `${pathSuffix}.maxzoom`, styleset?.[type]?.maxzoom);
	}
	return styleset;
}

export const addBackdropCallback = (
	map: object,
	layerType: string,
	stylesetPath: string,
	layerId: string,
	pathsID: string[],
	{
		prefix = '',
		suffix = 'symbolBackdrop',
		seperator = '-',
		c = undefined,
		pushToIdCollector = undefined,
		idCollector = undefined,
		addLayer = undefined,
		executeCallbacks = undefined,
		collStyleset = undefined,
		featStyleset = undefined,
		presetStyleset = undefined,
		sourceId = undefined,
		groupNames = undefined,
		filterId = undefined,
		pathsCB = undefined,
		collCallbacks = undefined
	}
) => {
	if (layerType === 'symbol') {
		if (c(stylesetPath, 'addSymbolBackdrop', null, { forceSkipValidation: true })) {

			// Define pathSuffix used in stylesets
			const pathSuffix = 'symbolBackdrop';

			// Tweak stylesets
			collStyleset = tweakBackdropStyle(collStyleset, stylesetPath, pathSuffix);
			collStyleset.force = tweakBackdropStyle(collStyleset.force, stylesetPath, pathSuffix);
			featStyleset = tweakBackdropStyle(featStyleset, stylesetPath, pathSuffix);
			presetStyleset = tweakBackdropStyle(presetStyleset, stylesetPath, pathSuffix);

			// Adapt layerId and path 
			//!TODO softcode this
			layerId = [prefix, layerId, suffix].filter(Boolean).join(seperator);
			stylesetPath = [stylesetPath, pathSuffix].join('.');

			// Add a 'circle'-Layer (even though listening to 'symbol' above!)
			map = addLayer(map, layerId, sourceId, groupNames, filterId, 'circle', c, stylesetPath);

			// Execute Callback (post-adding)
			//! DOCUMENT: it is not obvious, what layer to pass to executeCallbacks... I left it on 'symbol' but 'circle' would be plausible as well
			({ map, layerType, stylesetPath, layerId, pathsID } = executeCallbacks(
				collCallbacks,
				pathsCB.map((path) => `${path}.post`),
				map,
				layerType,
				stylesetPath,
				layerId,
				pathsID,
				{}
			));

			// push modified IDs to IdCollector
			pathsID = [
				'all',
				...pathsID
					.filter((path) => path.split('.').pop() === 'symbols')
					.map((path) => `${path}_symbolBackdrops`)
			];
			
			pushToIdCollector(idCollector, layerId, pathsID);
		}
	}
	// makeLayerInteractive(map, layerId);
};
