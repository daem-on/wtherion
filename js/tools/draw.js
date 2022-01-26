// drawing tool
// adapted from resources on http://paperjs.org

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
		pointDistance: 20,
		drawParallelLines: false,
		lines: 3,
		lineDistance: 10,
		closePath: 'near start',
		smoothPath : true
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
		},
		toolOptions: {
			type: "title",
			text: "Tool options"
		},
		pointDistance: {
			type: 'int',
			label: 'Point distance',
			min: 1
		},
		drawParallelLines: {
			type: 'boolean',
			label: 'Draw parallel lines'
		},
		lines: {
			type: 'int',
			label: 'Lines',
			requirements : {drawParallelLines: true},
			min: 1
		},
		lineDistance: {
			type: 'float',
			label: 'Line distance',
			requirements : {drawParallelLines: true},
			min: 0
		},
		closePath: {
			type: 'list',
			label: 'Close path',
			options: [ 'near start', 'always', 'never' ]
		},
		smoothPath: {
			type: 'boolean',
			label: 'Smooth path'
		}
	};

	var activateTool = function() {
		var paths = [];
		
		// get options from local storage if present
		options = pg.tools.getLocalOptions(options);
		
		tool = new paper.Tool();
		
		var lineCount;

		tool.onMouseDown = function(event) {
			if(event.event.button > 0) return;  // only first mouse button
			
			tool.fixedDistance = options.pointDistance;

			if (options.drawParallelLines) {
				lineCount = options.lines;
			} else {
				lineCount = 1;
			}
		
			for( var i=0; i < lineCount; i++) {
				var path = paths[i];
				path = pg.editTH2.createPath();
				
				settings = getSettings(path);
				settings.type = options.type;
				if (["wall", "border", "water-flow"].includes(options.type))
					settings.subtype = options.subtype;
				if (options.type === "slope") {
					settings.size = options.size;
				}
				pg.editTH2.drawLine(path);
				
				paths.push(path);
			}
		};

		tool.onMouseDrag = function(event) {
			if(event.event.button > 0) return;  // only first mouse button
						
			var offset = event.delta;
			offset.angle += 90;
			for( var i=0; i < lineCount; i++) {
				var path = paths[i];
				offset.length = options.lineDistance * i;
				path.add(event.middlePoint.add(offset));
			}
		};

		tool.onMouseUp = function(event) {
			if(event.event.button > 0) return;  // only first mouse button
			//
			// accidental clicks produce a path but no segments
			// so return if an accidental click happened
			if(paths[0].segments.length === 0) return;
			if(paths[0].segments.length === 1) {
				paths[0].remove();
			}
			
			var group;
			if(lineCount > 1) {
				group = new paper.Group();
			}
			
			var nearStart = pg.math.checkPointsClose(paths[0].firstSegment.point, event.point, 30);
			for( var i=0; i < lineCount; i++) {
				var path = paths[i];
				
				if(options.closePath === 'near start' && nearStart) {
					path.closePath(true);
				} else if(options.closePath === 'always') {
					path.closePath(true);
				}
				if(options.smoothPath) path.smooth();
				
				if(lineCount > 1) {
					group.addChild(path);
				}
			}
			
			paths = [];
			pg.undo.snapshot('draw');
			
		};
		
		// setup floating tool options panel in the editor
		pg.toolOptionPanel.setup(options, components, function() {
			pg.tools.setLocalOptions(options);
			lineCount = options.lines;
			tool.fixedDistance = options.pointDistance;
		});
		
		tool.activate();
		
	};


	return {
		options: options,
		activateTool:activateTool
	};

};
