import paper from "paper";
import pg from "../src/init";

export function zoomBy(factor: number) {
	paper.view.zoom *= factor;
	if(paper.view.zoom <= 0.01) {
		paper.view.zoom = 0.01;
	} else if(paper.view.zoom >= 1000) {
		paper.view.zoom = 1000;
	}
	pg.statusbar.update();
}


export function resetZoom() {
	paper.view.zoom = 1;
	pg.statusbar.update();
}


export function resetPan() {
	paper.view.center = pg.document.getCenter();
}

export function centerView() {
	paper.view.center = pg.layer.getActiveLayer().position;
}
