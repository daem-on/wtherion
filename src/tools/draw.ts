// drawing tool
// adapted from resources on http://paperjs.org

import { defineTool, getLocalOptions, setLocalOptions } from "../../src/tools";
import editTH2 from "../editTH2";
import * as undo from "../undo";
import toolOptionPanel, { componentList } from "../toolOptionPanel";
import subtypeList from "../res/subtype-list.json";
import { default as getSettings } from "../objectSettings/model/getSettings";
import { wallTypes } from "../res/wallTypes";
import LineSettings from "../objectSettings/model/LineSettings";
import * as math from "../math";
import paper from "paper";

let options = {
	id: "draw",
	type: "wall",
	subtype: "",
	size: 0,
	pointDistance: 20,
	drawParallelLines: false,
	lines: 3,
	lineDistance: 10,
	closePath: 'near start',
	smoothPath : true,
	simplifyPath : true
};
	
type comp = componentList<Partial<typeof options> & {toolOptions}>;

const components: comp = {
	type: {
		type: "customList",
		label: "%type%",
		options: wallTypes,
	},
	subtype: {
		type: "customList",
		label: "%subtype%",
		requirements: {type: ["wall", "border", "water-flow"]},
		options: subtypeList.wall,
		imageRoot: "assets/rendered/subtype"
	},
	size: {
		type: "int",
		label: "%size%",
		requirements: {
			type: "slope"
		}
	},
	toolOptions: {
		type: "title",
		text: "%toolOptions%"
	},
	pointDistance: {
		type: 'int',
		label: '%draw.pointDistance%',
		min: 1
	},
	drawParallelLines: {
		type: 'boolean',
		label: '%draw.drawParallelLines%'
	},
	lines: {
		type: 'int',
		label: '%draw.lines%',
		requirements : {drawParallelLines: true},
		min: 1
	},
	lineDistance: {
		type: 'float',
		label: '%draw.lineDistance%',
		requirements : {drawParallelLines: true},
		min: 0
	},
	closePath: {
		type: 'list',
		label: '%draw.closePath%',
		options: [ 'near start', 'always', 'never' ]
	},
	smoothPath: {
		type: 'boolean',
		label: '%draw.smoothPath%'
	},
	simplifyPath: {
		type: 'boolean',
		label: '%draw.simplifyPath%'
	}
};

export const draw = defineTool({
	definition: {
		id: 'draw',
		name: 'tools.draw',
		options,
	},
	setup(on, tool) {
		let paths: paper.Path[] = [];
		
		// get options from local storage if present
		options = getLocalOptions(options) as typeof options;
		
		let lineCount: number;

		on("activate", () => {
			// setup floating tool options panel in the editor
			toolOptionPanel.setupFloating(options, components, function() {
				setLocalOptions(options);
				lineCount = options.lines;
				tool.fixedDistance = options.pointDistance;
			});
		});

		on("mousedown", event => {
			if (event.event.button > 0) return;  // only first mouse button
			
			tool.fixedDistance = options.pointDistance;

			if (options.drawParallelLines) {
				lineCount = options.lines;
			} else {
				lineCount = 1;
			}
		
			for (let i=0; i < lineCount; i++) {
				let path = paths[i];
				path = editTH2.createPath();
				
				const settings = getSettings(path) as LineSettings;
				settings.type = options.type;
				if (["wall", "border", "water-flow"].includes(options.type))
					settings.subtype = options.subtype;
				if (options.type === "slope")
					settings.size = options.size;
				editTH2.drawLine(path);
				
				paths.push(path);
			}
		});

		on("mousedrag", event => {
			if (event.event.button > 0) return;  // only first mouse button
						
			const offset = event.delta;
			offset.angle += 90;
			for (let i=0; i < lineCount; i++) {
				const path = paths[i];
				offset.length = options.lineDistance * i;
				path.add(event.middlePoint.add(offset));
			}
		});

		on("mouseup", event => {
			if (event.event.button > 0) return;  // only first mouse button
			//
			// accidental clicks produce a path but no segments
			// so return if an accidental click happened
			if (paths[0].segments.length <= 1) {
				paths[0].remove();
				paths = [];
				return;
			}

			let group: paper.Group;
			if (lineCount > 1) {
				group = new paper.Group();
			}

			const nearStart = math.checkPointsClose(paths[0].firstSegment.point, event.point, 30);
			for (let i=0; i < lineCount; i++) {
				const path = paths[i];
				
				if (options.closePath === 'near start' && nearStart) {
					path.closePath();
				} else if (options.closePath === 'always') {
					path.closePath();
				}
				if (options.smoothPath) path.smooth();
				if (options.simplifyPath) path.simplify();
				
				if (lineCount > 1) {
					group.addChild(path);
				}
			}

			paths = [];
			undo.snapshot('draw');
		});
	},
});
