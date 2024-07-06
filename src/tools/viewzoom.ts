// view zoom tool
// adapted from http://sketch.paperjs.org/
import paper from "paper";
import { zoomBy } from "../view";
import { defineTool } from "grapht/tools";
import { triggers } from "../triggers";

function onWheel(updateInfo: WheelEvent) {
	let factor = 1.25;
	if (updateInfo.deltaY >= 0 && updateInfo.detail >= 0) {
		// scroll down / zoom out
		factor = 1 / factor;
	}

	zoomBy(factor);
	const viewPosition = paper.view.getEventPoint(updateInfo as any);
		
	const mpos = viewPosition;
	const ctr = paper.view.center;
	
	const pc = mpos.subtract(ctr);
	const offset = mpos.subtract(pc.multiply(factor)).subtract(ctr).multiply(-1);
	paper.view.center = paper.view.center.add(offset);

	triggers.emit("Zoom");
}

export const viewzoom = defineTool({
	definition: {
		id: "viewzoom",
		name: "Viewzoom",
		type: "hidden",
	},
	setup(on) {
		on("wheel", ev => onWheel(ev));
	},
});
