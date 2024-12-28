import {drawTestPoints} from './drawTestPoints'
import {drawTestLines} from './drawTestLines'

export function drawTestFeatures(map) {
	drawTestPoints(map);
	drawTestLines(map);
}
