// functions related to guide items

import { removePaperItemsByDataTags, removePaperItemsByTags } from "./helper";
import paper from "paper";
import { getGuideLayer } from "./layer";

const guideBlue = new paper.Color('#009dec');
const guideGrey = new paper.Color('#aaaaaa');

export function hoverItem(hitResult) {
	const segments = hitResult.item.segments;
	const clone = new paper.Path(segments);
	setDefaultGuideStyle(clone);
	if(hitResult.item.closed) {
		clone.closed = true;
	}
	clone.parent = getGuideLayer() || null;
	clone.strokeColor = guideBlue;
	clone.fillColor = null;
	clone.data.isHelperItem = true;
	clone.bringToFront();

	return clone;
}


export function hoverBounds(item) {
	const rect = new paper.Path.Rectangle(item.internalBounds);
	rect.matrix = item.matrix;
	setDefaultGuideStyle(rect);
	rect.parent = getGuideLayer() || null;
	rect.strokeColor = guideBlue;
	rect.fillColor = null;
	rect.data.isHelperItem = true;
	rect.bringToFront();

	return rect;
}


export function rectSelect(event, color?) {
	const half = new paper.Point(0.5 / paper.view.zoom, 0.5 / paper.view.zoom);
	const start = event.downPoint.add(half);
	const end = event.point.add(half);
	const rect = new paper.Path.Rectangle(start, end);
	const zoom = 1.0/paper.view.zoom;
	setDefaultGuideStyle(rect);
	if(!color) color = guideGrey;
	rect.parent = getGuideLayer() || null;
	rect.strokeColor = color;
	rect.data.isRectSelect = true;
	rect.data.isHelperItem = true;
	rect.dashArray = [3.0*zoom, 3.0*zoom];
	return rect;
}


export function line(from, to, color) {
	const line = new paper.Path.Line(from, to);
	const zoom = 1/paper.view.zoom;
	setDefaultGuideStyle(line);
	if (!color) color = guideGrey;
	line.parent = getGuideLayer() || null;
	line.strokeColor = color;
	line.strokeColor = color;
	line.dashArray = [5*zoom, 5*zoom];
	line.data.isHelperItem = true;
	return line;
}


export function crossPivot(center, color) {
	const zoom = 1/paper.view.zoom;
	const star = new paper.Path.Star(center, 4, 4*zoom, 0.5*zoom);
	setDefaultGuideStyle(star);
	if(!color) color = guideBlue;
	star.parent = getGuideLayer() || null;
	star.fillColor = color;
	star.strokeColor = color;
	star.strokeWidth = 0.5*zoom;
	star.data.isHelperItem = true;
	star.rotate(45);

	return star;
}


export function rotPivot(center, color) {
	const zoom = 1/paper.view.zoom;
	const path = new paper.Path.Circle(center, 3*zoom);
	setDefaultGuideStyle(path);
	if(!color) color = guideBlue;
	path.parent = getGuideLayer() || null;
	path.fillColor = color;
	path.data.isHelperItem = true;

	return path;
}


export function label(pos, content, color) {
	const text = new paper.PointText(pos);
	if(!color) color = guideGrey;
	text.parent = getGuideLayer() || null;
	text.fillColor = color;
	text.content = content;
}


export function setDefaultGuideStyle(item) {
	item.strokeWidth = 1/paper.view.zoom;
	item.opacity = 1;
	item.blendMode = 'normal';
	item.guide = true;
}


export function getGuideColor(colorName) {
	if(colorName === 'blue') {
		return guideBlue;
	} else if(colorName === 'grey') {
		return guideGrey;
	}
}


export function getAllGuides() {
	const allItems = [];
	for(let i=0; i<paper.project.layers.length; i++) {
		const layer = paper.project.layers[i];
		for(let j=0; j<layer.children.length; j++) {
			const child = layer.children[j];
			// only give guides
			if(!(child as any).guide) {
				continue;
			}
			allItems.push(child);
		}
	}
	return allItems;
}


export function getExportRectGuide() {
	const guides = getAllGuides();
	for(let i=0; i<guides.length; i++){
		if(guides[i].data && guides[i].data.isExportRect) {
			return guides[i];
		}
	}
}


export function removeHelperItems() {
	removePaperItemsByDataTags(['isHelperItem']);
}


export function removeAllGuides() {
	removePaperItemsByTags(['guide']);
}


export function removeExportRectGuide() {
	removePaperItemsByDataTags(['isExportRect']);
}