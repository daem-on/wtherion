// view zoom tool
// adapted from http://sketch.paperjs.org/

module.exports = function() {
	var tool;
	// var ePoint;
	
	var options = {};
	
	var activateTool = function() {
		tool = new Tool();
		
		// ePoint = paper.view.center;
		
		// tool.onMouseMove = function(event) {
		// 	ePoint = event.event;
		// };
		
		tool.activate();
	};
	
	
	var updateTool = function(updateInfo) {
						
		var factor = 1.25;
		if (updateInfo.originalEvent.wheelDelta > 0 || updateInfo.originalEvent.detail < 0) {
			// scroll up / zoom in

		} else {
			// scroll down / zoom out
			factor = 1 / factor;
		}

		pg.view.zoomBy(factor);
		var viewPosition = paper.view.getEventPoint(updateInfo.originalEvent);
			
		var mpos = viewPosition;
		var ctr = paper.view.center;
		
		var pc = mpos.subtract(ctr);
		var offset = mpos.subtract(pc.multiply(factor)).subtract(ctr).multiply(-1);
		paper.view.center = paper.view.center.add(offset);
	};
	
	
	return {
		options:options,
		activateTool : activateTool,
		updateTool: updateTool
	};
};



