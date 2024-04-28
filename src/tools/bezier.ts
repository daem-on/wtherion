// bezier tool
// adapted from the paperjs examples (Tools/BezierTool.html)

import paper from "paper";
import { markRaw, ref } from "vue";
import LineSettings from "../../src/objectSettings/model/LineSettings";
import getSettings from "../../src/objectSettings/model/getSettings";
import BezierPanel from "../components/panels/tools/BezierPanel.vue";
import { clearSelection } from "../selection";
import { defineTool } from "../tools";
import * as undo from "../undo";
import { createPath, drawLine } from "../objectDefs";

export const bezierOptions = ref({
	type: "wall",
	subtype: "",
	size: 0,
});

export const showBezierPanel = ref(true);

type TypedHitResult<T extends paper.Item> = paper.HitResult & {item: T}

let onFinish: undefined | (() => void);
		
const hitOptions: HitOptions = {
	segments: true,
	stroke: true,
	curves: true,
	guides: false,
	tolerance: 0,
	match: hitResult => hitResult.item.selected,
};

export const bezier = defineTool({
	definition: {
		id: "bezier",
		name: "tools.bezier",
		panel: markRaw(BezierPanel),
		actions: [{
			name: "finish",	
			callback: () => onFinish?.(),
			defaultKey: "enter",
			category: "lines",
		}]
	},
	uiState: {
		options: bezierOptions.value
	},
	setup(on) {
		on("activate", () => {
			showBezierPanel.value = true;
		});

		let path: paper.Path;

		let currentSegment: paper.Segment;

		let mode: "continue" | "close" | "remove" | "add";
		let type: string;

		function createNewPath() {
			path = createPath();

			const settings = getSettings(path) as LineSettings;
			const options = bezierOptions.value;
			settings.type = options.type;
			if (["wall", "border", "water-flow"].includes(options.type))
				settings.subtype = options.subtype;
			if (options.type === "slope")
				settings.size = options.size;
			drawLine(path);
			
			showBezierPanel.value = false;
		}

		function finish() {
			clearSelection();
			undo.snapshot("bezierFinish");
			path = null;
		}
		onFinish = finish;
		
		on("mousedown", event => {
			if (event.event.button > 0) return;  // only first mouse button

			const selectedSegment = currentSegment?.selected ? currentSegment : null;
			function unselectSegment() {
				if (selectedSegment) selectedSegment.selected = false;
			}
			mode = type = currentSegment = null;

			hitOptions.tolerance = 5 / paper.view.zoom;
			const hitResult = paper.project.hitTest(event.point, hitOptions) as TypedHitResult<paper.Path>;
			
			if (!path) {
				if (!hitResult) {
					clearSelection();
					createNewPath();
					
				} else {
					path = hitResult.item;
					if (!hitResult.item.closed && findHandle(path, event.point) && isEndingSegment(hitResult.segment)) {
						mode = "continue";
						currentSegment = hitResult.segment;
						if (hitResult.segment.isFirst()) path.reverse();
						currentSegment.selected = true;
					} 
				}
				
			}
			
			if (path) {
				const result = findHandle(path, event.point);
				if (result && mode !== "continue") {
					currentSegment = result.segment;
					type = result.type;
					if (result.type === "point") {
						if (result.segment.index === 0 && path.segments.length > 1 && !path.closed) {
							mode = "close";
							path.closed = true;
							unselectSegment();
							path.firstSegment.selected = true;
							undo.snapshot("bezierClose");
						}
					} else if (result.type === "handleIn" || result.type === "handleOut") {
						mode = "continue";
					}
				}

				
				if (!currentSegment) {
					if (hitResult) {
						if (hitResult.type === "segment" && !hitResult.item.closed && isEndingSegment(hitResult.segment)) {
						
							// joining two paths
							const hoverPath = hitResult.item;
							// check if the connection point is the first segment
							// reverse path if it is not because join() 
							// always connects to first segment)
							if (!hitResult.segment.isFirst()) hoverPath.reverse();
							path.join(hoverPath);
							path = null;
							unselectSegment();
							undo.snapshot("bezierJoin");

						} else if (hitResult.type === "curve" || hitResult.type === "stroke") {
							mode = "add";
							// inserting segment on curve/stroke
							unselectSegment();
							const location = hitResult.location;
							currentSegment = path.insert(location.index + 1, event.point);
							currentSegment.selected = true;
							undo.snapshot("bezierAddSegment");
						}

					} else {
						mode = "add";
						// add a new segment to the path
						unselectSegment();
						currentSegment = path.add(event.point) as paper.Segment;
						currentSegment.selected = true;
					}
				}
			}

		});
		
		on("mousedrag", event => {
			if (event.event.button > 0) return;  // only first mouse button
			if (!currentSegment || !mode) return;
			
			let delta = event.delta.clone();
			if (type === "handleOut" || mode === "add") {
				delta = delta.multiply(-1);
			}
			currentSegment.handleIn = currentSegment.handleIn.add(delta);
			currentSegment.handleOut = currentSegment.handleOut.subtract(delta);
		});
		
		on("mouseup", event => {
			if (event.event.button > 0) return;  // only first mouse button
			
			if (mode === "add") {
				undo.snapshot("bezierAdd");
			}
			else if (path && path.closed) finish();
			mode = null;
		});

		on("deactivate", () => {
			path = null;
		});
	},
});
	
const findHandle = function(path: paper.Path, point: paper.Point) {
	const types = ["point", "handleIn", "handleOut"];
	const tolerance = 6/paper.view.zoom;
	for (let i = 0, l = path.segments.length; i < l; i++) {
		const segment = path.segments[i];
		if (segment.selected) {
			for (let j = 0; j < 3; j++) {
				const type = types[j];
				const segmentPoint = type === "point"
						? segment.point
						: segment.point.add(segment[type]);
				const distance = (point.subtract(segmentPoint)).length;
				if (distance < tolerance) {
					return { type: type, segment: segment };
				}
			}
		} else {
			const distance = (point.subtract(segment.point)).length;
			if (distance < tolerance)
				return { type: "point", segment: segment };
		}
	}
	return null;
};

function isEndingSegment(segment: paper.Segment) {
	return segment.isLast() || segment.isFirst();
}
