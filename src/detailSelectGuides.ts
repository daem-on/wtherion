import * as wtConfig from "./filesio/configManagement";
import getSettings from "./objectSettings/model/getSettings";
import * as selection from "./selection";
import { getGuideLayer } from "./layer";

const zero = new paper.Point(0, 0);
const offset = new paper.Point(0, 7);
const endoffset = new paper.Point(7, -7);

let guideTextPool: paper.PointText[] = [];
let currentIndex = 0;
function getNextGuide() {
	if (guideTextPool.length > currentIndex)
		return guideTextPool[currentIndex++];
	else {
		const text = new paper.PointText(zero);
		guideTextPool.push(text);
		return guideTextPool[currentIndex++];
	}
}

export function drawGuides() {
	if (!wtConfig.get("detailSelectGuides")) return;
	const selected = selection.getSelectedItems();
	const layer = getGuideLayer();
	hideGuideNumbers();

	if (layer === false) return;
	if (selected.length !== 1) return;
	if (selected[0].className !== "Path") return;
	const path = selected[0] as paper.Path;
	const settings = getSettings(path);
	if (settings.className !== "LineSettings") return;

	for (const segment of path.segments) {
		const text = getNextGuide();
		text.visible = true;
		text.content = settings.subtypes[segment.index] || segment.index.toString();
		
		if (!path.closed && (segment.isFirst() || segment.isLast())) {
			text.point = segment.point.add(endoffset);
		} else {
			const vec1 = segment.previous.point.subtract(segment.point).normalize();
			const vec2 = segment.next.point.subtract(segment.point).normalize();
			const avg = vec1.add(vec2).multiply(0.5);
			text.point = segment.point.add(avg.normalize(-14));

			if (text.content.length > 1) {
				if (avg.x < 0) text.justification = "left";
				else text.justification = "right";
			} else {
				text.justification = "center";
				text.point = text.point.add(offset);
			}
		}

		text.addTo(layer);
	}
}

export function hideGuideNumbers() {
	currentIndex = 0;
	for (const item of guideTextPool) {
		item.visible = false;
	}
}

export function clearGuideNumbers() {
	for (const item of guideTextPool) {
		item.remove();
	}
	guideTextPool = [];
}