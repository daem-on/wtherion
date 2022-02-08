// bezier tool
// adapted from the paperjs examples (Tools/BezierTool.html)

const wallList = require("../res/walls-list.json");
const subtypeList = require("../res/subtype-list.json");
const { default: getSettings } = require("../../src/objectSettings/model/getSettings");

module.exports = function() {
	var tool;
	
	var options = {
		id: "draw",
		type: "wall",
		subtype: "",
		size: 0,
	};
	
	/** @type {import("../toolOptionPanel").componentList} */
	var components = {
		type: {
			type: "customList",
			label: "Type",
			options: wallList.passages,
		},
		subtype: {
			type: "customList",
			label: "Subtype",
			requirements: {type: ["wall", "border", "water-flow"]},
			options: subtypeList.wall,
			imageRoot: "assets/rendered/subtype"
		},
		size: {
			type: "int",
			label: "Size",
			requirements: {
				type: "slope"
			}
		}
	};

	var activateTool = function() {
		tool = new paper.Tool();
		options = pg.tools.getLocalOptions(options);
		
		var path;

		var currentSegment;
		var mode;
		var type;
		var hoveredItem = null;
		
		var hitOptions = {
			segments: true,
			stroke: true,
			curves: true,
			guide: false,
			tolerance: 5 / paper.view.zoom
		};
		
		tool.onMouseDown = function(event) {
			if(event.event.button > 0) return;  // only first mouse button
			
			if (currentSegment) {
				currentSegment.selected = false;
			}
			mode = type = currentSegment = null;
			
			if(!path) {
				if(!hoveredItem) {
					pg.selection.clearSelection();
					path = pg.editTH2.createPath();

					settings = getSettings(path);
					settings.type = options.type;
					if (["wall", "border", "water-flow"].includes(options.type))
						settings.subtype = options.subtype;
					if (options.type === "slope")
						settings.size = options.size;
					pg.editTH2.drawLine(path);
					jQuery('.toolOptionPanel').remove();
					
				} else {
					path = hoveredItem.item;
					if(!hoveredItem.item.closed
						&& findHandle(path, event.point)) {
						mode = 'continue';
						currentSegment = hoveredItem.segment;
						if(hoveredItem.item.lastSegment !== hoveredItem.segment) {
							path.reverse();
						}
						
					} 
				}
				
			}
			
			if(path) {
				var result = findHandle(path, event.point);
				if (result && mode !== 'continue') {
					currentSegment = result.segment;
					type = result.type;
					if (result.type === 'point') {
						if( result.segment.index === 0 && 
							path.segments.length > 1 &&
							!path.closed) {
							mode = 'close';
							path.closed = true;
							path.firstSegment.selected = true;
							
						} else {
							mode = 'remove';
							result.segment.remove();
							
						}
					}
				}

				
				if (!currentSegment) {
					if(hoveredItem) {
						if(hoveredItem.type === 'segment' && 
							!hoveredItem.item.closed) {
						
							// joining two paths
							var hoverPath = hoveredItem.item;
							// check if the connection point is the first segment
							// reverse path if it is not because join() 
							// always connects to first segment)
							if(hoverPath.firstSegment !== hoveredItem.segment) {
								hoverPath.reverse();
							}
							path.join(hoverPath);
							path = null;

						} else if(hoveredItem.type === 'curve' || 
							hoveredItem.type === 'stroke') {
						
							mode = 'add';
							// inserting segment on curve/stroke
							var location = hoveredItem.location;
							currentSegment = path.insert(location.index + 1, event.point);
							currentSegment.selected = true;
						}

					} else {
						mode = 'add';
						// add a new segment to the path
						currentSegment = path.add(event.point);
						currentSegment.selected = true;
						
					}
				}
				
				
			}
		};
		
		tool.onMouseMove = function(event) {			
			var hitResult = paper.project.hitTest(event.point, hitOptions);
			if(hitResult && hitResult.item && hitResult.item.selected) {
				hoveredItem = hitResult;
				
			} else {
				hoveredItem = null;
			}
		};
		
		tool.onMouseDrag = function(event) {
			if(event.event.button > 0) return;  // only first mouse button
			if (!currentSegment) return;
			
			var delta = event.delta.clone();
			if (type === 'handleOut' || mode === 'add') {
				delta = delta.multiply(-1);
			}
			currentSegment.handleIn = currentSegment.handleIn.add(delta);
			currentSegment.handleOut = currentSegment.handleOut.subtract(delta);
		};
		
		tool.onMouseUp = function(event) {
			if(event.event.button > 0) return;  // only first mouse button
			
			if(path && path.closed) {
				pg.undo.snapshot('bezier');
				path = null;
			}
			
		};
		
		pg.toolOptionPanel.setup(options, components, function() {
			pg.tools.setLocalOptions(options);
		});
		
		tool.activate();
	};
	
	var findHandle = function(path, point) {
		var types = ['point', 'handleIn', 'handleOut'];
		for (var i = 0, l = path.segments.length; i < l; i++) {
			for (var j = 0; j < 3; j++) {
				var type = types[j];
				var segment = path.segments[i];
				var segmentPoint = type === 'point'
						? segment.point
						: segment.point.add(segment[type]);
				var distance = (point.subtract(segmentPoint)).length;
				if (distance < 6) {
					return {
						type: type,
						segment: segment
					};
				}
			}
		}
		return null;
	};

	
	return {
		options: options,
		activateTool : activateTool
	};
	
};