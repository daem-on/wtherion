import pg from "../init";

export function activateTool() {
	let tool = new paper.Tool();

	tool.onMouseDown = function(event: any) {
		if (event.event.button > 0) return;

		let point = pg.editTH2.createPoint(event.point);
		pg.editTH2.drawPoint(point);
	}

	tool.activate();
}

export let options = {};