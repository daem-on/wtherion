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

export const bezier = defineTool({
	definition: {
		id: 'bezier',
		name: 'tools.bezier',
		panel: markRaw(BezierPanel),
		actions: [{
			name: "finish",	
			callback: () => onFinish?.(),
			defaultKey: "enter",
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

		let dirty = false;
		let mode: "continue" | "close" | "remove" | "add";
		let type: string;
		let hoveredItem: TypedHitResult<paper.Path> = null;
		
		const hitOptions = {
			segments: true,
			stroke: true,
			curves: true,
			guide: false,
			tolerance: 5 / paper.view.zoom
		};

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
			undo.snapshot('bezier');
			dirty = false;
			path = null;
		}
		onFinish = finish;

		function snapshotIfDirty() {
			if (dirty) {
				undo.snapshot("bezier");
				dirty = false;
			}
		}
		
		on("mousedown", event => {
			if (event.event.button > 0) return;  // only first mouse button

			const selectedSegment = currentSegment?.selected ? currentSegment : null;
			function unselectSegment() {
				if (selectedSegment) selectedSegment.selected = false;
			}
			mode = type = currentSegment = null;
			
			if (!path) {
				if (!hoveredItem) {
					clearSelection();
					createNewPath();
					dirty = true;
					
				} else {
					path = hoveredItem.item;
					if (!hoveredItem.item.closed
						&& findHandle(path, event.point)) {
						mode = 'continue';
						currentSegment = hoveredItem.segment;
						if (hoveredItem.item.lastSegment !== hoveredItem.segment) {
							path.reverse();
						}
						
					} 
				}
				
			}
			
			if (path) {
				const result = findHandle(path, event.point);
				if (result && mode !== 'continue') {
					currentSegment = result.segment;
					type = result.type;
					if (result.type === 'point') {
						if (result.segment.index === 0 && 
							path.segments.length > 1 &&
							!path.closed) {
							mode = 'close';
							path.closed = true;
							unselectSegment();
							path.firstSegment.selected = true;
							
						} else {
							mode = 'remove';
							result.segment.remove();
							
						}
						dirty = true;
					}
				}

				
				if (!currentSegment) {
					if (hoveredItem) {
						if (hoveredItem.type === 'segment' && 
							!hoveredItem.item.closed) {
						
							// joining two paths
							const hoverPath = hoveredItem.item;
							// check if the connection point is the first segment
							// reverse path if it is not because join() 
							// always connects to first segment)
							if (hoverPath.firstSegment !== hoveredItem.segment) {
								if (hoverPath.lastSegment === hoveredItem.segment) {
									hoverPath.reverse();
								} else return;
							}
							path.join(hoverPath);
							path = null;
							unselectSegment();
							dirty = true;

						} else if (hoveredItem.type === 'curve' || 
							hoveredItem.type === 'stroke') {
						
							mode = 'add';
							// inserting segment on curve/stroke
							unselectSegment();
							const location = hoveredItem.location;
							currentSegment = path.insert(location.index + 1, event.point);
							currentSegment.selected = true;
						}

					} else {
						mode = 'add';
						// add a new segment to the path
						unselectSegment();
						currentSegment = path.add(event.point) as paper.Segment;
						currentSegment.selected = true;
						
					}
				} else {
					currentSegment.selected = true;
				}
				
				if (mode === "add" || mode === "continue") dirty = true;
			}

		});
		
		on("mousemove", event => {
			const hitResult = paper.project.hitTest(event.point, hitOptions) as TypedHitResult<paper.Path>;
			
			if (hitResult?.item?.selected) hoveredItem = hitResult;
			else hoveredItem = null;
		});
		
		on("mousedrag", event => {
			if (event.event.button > 0) return;  // only first mouse button
			if (!currentSegment) return;
			
			let delta = event.delta.clone();
			if (type === 'handleOut' || mode === 'add') {
				delta = delta.multiply(-1);
			}
			currentSegment.handleIn = currentSegment.handleIn.add(delta);
			currentSegment.handleOut = currentSegment.handleOut.subtract(delta);
		});
		
		on("mouseup", event => {
			if (event.event.button > 0) return;  // only first mouse button
			
			if (path && path.closed) finish();
		});

		on("deactivate", () => {
			snapshotIfDirty();
			path = null;
		});
	},
});
	
const findHandle = function(path: paper.Path, point: paper.Point) {
	const types = ['point', 'handleIn', 'handleOut'];
	const tolerance = 6/paper.view.zoom;
	for (let i = 0, l = path.segments.length; i < l; i++) {
		const segment = path.segments[i];
		if (segment.selected) {
			for (let j = 0; j < 3; j++) {
				const type = types[j];
				const segmentPoint = type === 'point'
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