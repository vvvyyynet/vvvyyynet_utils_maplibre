import {drawTestPoints} from './drawTestPoints'
import {drawTestLines} from './drawTestLines'
import {drawTestPolygons} from './drawTestPolygons'

export function drawTestFeatures(map) {
	drawTestPoints(map);
	drawTestLines(map);
	drawTestPolygons(map);
}
