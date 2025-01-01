import {drawHardcodedPoints} from './drawHardcodedPoints'
import {drawHardcodedLines} from './drawHardcodedLines'
import {drawHardcodedPolygons} from './drawHardcodedPolygons'

export function drawHardcodedFeatures(map) {
	drawHardcodedPoints(map);
	drawHardcodedLines(map);
	drawHardcodedPolygons(map);
}
