// view zoom tool
// adapted from http://sketch.paperjs.org/
import paper from "paper";
import { zoomBy } from "../view";

module.exports = function() {
	let tool: paper.Tool;
	// var ePoint;
	
	const options = {};
	
	const activateTool = function() {
		tool = new paper.Tool();
		
		// ePoint = paper.view.center;
		
		// tool.onMouseMove = function(event) {
		// 	ePoint = event.event;
		// };
		
		tool.activate();
	};
	
	
	const updateTool = function(updateInfo) {
						
		let factor = 1.25;
		if (updateInfo.wheelDelta > 0 || updateInfo.detail < 0) {
			// scroll up / zoom in

		} else {
			// scroll down / zoom out
			factor = 1 / factor;
		}

		zoomBy(factor);
		const viewPosition = paper.view.getEventPoint(updateInfo);
			
		const mpos = viewPosition;
		const ctr = paper.view.center;
		
		const pc = mpos.subtract(ctr);
		const offset = mpos.subtract(pc.multiply(factor)).subtract(ctr).multiply(-1);
		paper.view.center = paper.view.center.add(offset);
	};
	
	
	return {
		options:options,
		activateTool : activateTool,
		updateTool: updateTool
	};
};



