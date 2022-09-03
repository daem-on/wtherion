// view zoom tool
// adapted from http://sketch.paperjs.org/
import paper from "paper";
import { zoomBy } from "../view";

export default function() {
	let tool: paper.Tool;
	const options = {};
	
	const activateTool = function() {
		tool = new paper.Tool();
		tool.activate();
	};
	
	const updateTool = function(updateInfo: WheelEvent) {
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
	};
	
	
	return {
		options: options,
		activateTool: activateTool,
		updateTool: updateTool
	};
}



