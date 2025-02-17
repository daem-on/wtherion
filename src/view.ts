import paper from "paper";
import * as layer from "./layer";
import * as pgDocument from "./document";

export function zoomBy(factor: number) {
	paper.view.zoom *= factor;
	if(paper.view.zoom <= 0.01) {
		paper.view.zoom = 0.01;
	} else if(paper.view.zoom >= 1000) {
		paper.view.zoom = 1000;
	}
}


export function resetZoom() {
	paper.view.zoom = 1;
}


export function resetPan() {
	paper.view.center = pgDocument.getCenter();
}

export function centerView() {
	paper.view.center = layer.getActiveLayer().position;
}
