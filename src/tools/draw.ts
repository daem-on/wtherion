// drawing tool
// adapted from resources on http://paperjs.org

import paper from "paper";
import { markRaw, ref } from "vue";
import { defineTool } from "../../src/tools";
import DrawPanel from "../components/panels/tools/DrawPanel.vue";
import * as math from "../math";
import LineSettings from "../objectSettings/model/LineSettings";
import { default as getSettings } from "../objectSettings/model/getSettings";
import * as undo from "../undo";
import { createPath, drawLine } from "../objectDefs";

export const drawOptions = ref({
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
});

export const draw = defineTool({
	definition: {
		id: 'draw',
		name: 'tools.draw',
		panel: markRaw(DrawPanel),
	},
	uiState: {
		options: drawOptions.value
	},
	setup(on, tool) {
		let paths: paper.Path[] = [];
		
		let lineCount: number;

		on("mousedown", event => {
			if (event.event.button > 0) return;  // only first mouse button
			
			const options = drawOptions.value;
			tool.fixedDistance = options.pointDistance;

			if (options.drawParallelLines) {
				lineCount = options.lines;
			} else {
				lineCount = 1;
			}
		
			for (let i=0; i < lineCount; i++) {
				let path = paths[i];
				path = createPath();
				
				const settings = getSettings(path) as LineSettings;
				settings.type = options.type;
				if (["wall", "border", "water-flow"].includes(options.type))
					settings.subtype = options.subtype;
				if (options.type === "slope")
					settings.size = options.size;
				drawLine(path);
				
				paths.push(path);
			}
		});

		on("mousedrag", event => {
			if (event.event.button > 0) return;  // only first mouse button
						
			const offset = event.delta;
			offset.angle += 90;
			for (let i=0; i < lineCount; i++) {
				const path = paths[i];
				offset.length = drawOptions.value.lineDistance * i;
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
			const options = drawOptions.value;
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
