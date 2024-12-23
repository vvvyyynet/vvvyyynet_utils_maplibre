//----------------------------------------------
// Console Log all layers
export function consoleLogAllLayers(map) {
	const allLayers = map.getStyle().layers;
	allLayers.forEach((layer) => console.log(layer));
}
