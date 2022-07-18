// bezier tool
// adapted from the paperjs examples (Tools/BezierTool.html)

import pg from "../../src/init";
import paper from "paper";
import subtypeList from "Res/subtype-list.json";
import { default as getSettings } from "../../src/objectSettings/model/getSettings";
import { wallTypes } from "Res/wallTypes";
import { componentList } from "../toolOptionPanel";
import LineSettings from "../../src/objectSettings/model/LineSettings";
import { getToolInfoByID } from "../../src/tools";

export default function() {
	let tool: paper.Tool;
	
	let options = {
		id: "draw",
		type: "wall",
		subtype: "",
		size: 0,
	};

	const components: componentList<Partial<typeof options>> = {
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
		}
	};

	type TypedHitResult<T extends paper.Item> = paper.HitResult & {item: T}

	const activateTool = function() {
		tool = new paper.Tool();
		options = pg.tools.getLocalOptions(options) as typeof options;
		const toolInfo = getToolInfoByID("bezier");
		
		let path: paper.Path;

		let currentSegment: paper.Segment;

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

					const settings = getSettings(path) as LineSettings;
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
				const result = findHandle(path, event.point);
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
							const hoverPath = hoveredItem.item;
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
							const location = hoveredItem.location;
							currentSegment = path.insert(location.index + 1, event.point);
							currentSegment.selected = true;
						}

					} else {
						mode = 'add';
						// add a new segment to the path
						currentSegment = path.add(event.point) as paper.Segment;
						currentSegment.selected = true;
						
					}
				}
				
				
			}
		};
		
		tool.onMouseMove = function(event) {			
			const hitResult = paper.project.hitTest(event.point, hitOptions) as TypedHitResult<paper.Path>;
			
			if(hitResult?.item?.selected) hoveredItem = hitResult;
			else hoveredItem = null;
		};
		
		tool.onMouseDrag = function(event) {
			if(event.event.button > 0) return;  // only first mouse button
			if (!currentSegment) return;
			
			let delta = event.delta.clone();
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

		tool.onKeyDown = function(event: paper.KeyEvent) {
			if (event.key == "enter" || event.key == toolInfo.usedKeys.toolbar) {
				pg.selection.clearSelection();
				pg.undo.snapshot('bezier');
				path = null;
			}
		};
		
		pg.toolOptionPanel.setupFloating(options, components, function() {
			pg.tools.setLocalOptions(options);
		});
		
		tool.activate();
	};
	
	const findHandle = function(path: paper.Path, point: paper.Point) {
		const types = ['point', 'handleIn', 'handleOut'];
		for (let i = 0, l = path.segments.length; i < l; i++) {
			for (let j = 0; j < 3; j++) {
				const type = types[j];
				const segment = path.segments[i];
				const segmentPoint = type === 'point'
						? segment.point
						: segment.point.add(segment[type]);
				const distance = (point.subtract(segmentPoint)).length;
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
	
}