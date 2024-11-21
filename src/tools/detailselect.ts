// select tool
// adapted from resources on http://paperjs.org and 
// https://github.com/memononen/stylii
import { useDoubleClick, useRectangularSelection } from "@daem-on/graphite/interactions";
import { notifyViewChanged } from "@daem-on/graphite/render";
import { defineTool, ToolAction } from "@daem-on/graphite/tools";
import paper from "paper";
import callSplitUrl from "../../assets/ui/call_split.svg";
import deleteUrl from "../../assets/ui/delete.svg";
import linearScaleUrl from "../../assets/ui/linear_scale.svg";
import selectAllUrl from "../../assets/ui/select_all.svg";
import { updateWindow } from "../../src/objectSettings/objectOptionPanel";
import * as compoundPath from "../compoundPath";
import * as hover from "../hover";
import * as math from "../math";
import * as selection from "../selection";
import * as undo from "../undo";

const actions: ToolAction[] = [
	{
		name: "selectAll",
		callback: () => selection.selectAllSegments(),
		defaultKey: "ctrl-a",
		category: "selection",
		icon: selectAllUrl,
		label: "selectAll"
	},
	{
		name: "invertSelection",
		callback: () => selection.invertSegmentSelection(),
		defaultKey: "ctrl-i",
		category: "selection",
	},
	{
		name: "selectNone",
		callback: () => selection.clearSelection(),
		category: "selection",
		label: "deselectAll"
	},
	{
		name: "switchHandles",
		callback: () => selection.switchSelectedHandles(),
		category: "segment",
		icon: linearScaleUrl,
	},
	{
		name: "smoothHandles",
		callback: () => selection.smoothHandles(),
		category: "segment",
	},
	{
		name: "removeSegments",
		callback: () => selection.removeSelectedSegments(),
		category: "segment",
		icon: deleteUrl,
		defaultKey: "delete",
	},
	{
		name: "splitPath",
		callback: () => selection.splitPathAtSelectedSegments(),
		category: "segment",
		icon: callSplitUrl,
	},
];

const hitOptions: HitOptions = {
	segments: true,
	stroke: true,
	curves: true,
	handles: true,
	fill: true,
	guides: false,
	tolerance: 0,
	match: hit => {
		if (hit.item.layer !== paper.project.activeLayer) return false;
		if (hit.item.className !== "Path") return false;
		return true;
	},
};

const snapHitOptions: HitOptions = {
	stroke: false,
	curves: true,
	guides: false,
	class: paper.Path,
	tolerance: 0,
};

export const detailselect = defineTool({
	definition: {
		id: "detailselect",
		name: "tools.detailSelect",
		actions
	},
	setup(on) {
		const detectDoubleClick = useDoubleClick({ threshold: 250 });
		const rectSelection = useRectangularSelection(paper);
		
		let mode: "none" | "select" | "move" = "none";
		let hitType: "fill" | "point" | "curve" | "handle-in" | "handle-out" | null = null;

		const origPositions = new Map<paper.Item | paper.Segment, paper.Point>();

		on("activate", () => {});

		on("mousedown", event => {
			if (event.event.button > 0) return; // only first mouse button
			
			mode = "none";
			
			const doubleClicked = detectDoubleClick(event);

			if (doubleClicked && !event.modifiers.shift) {
				selection.clearSelection();
			}
			
			hitType = null;
			hover.clearHoveredItem();

			const hitResult = paper.project.hitTest(event.point, { ...hitOptions, tolerance: 6 / paper.view.zoom });

			if (!hitResult) {
				if (!event.modifiers.shift) {
					selection.clearSelection();
				}
				mode = "select";
				rectSelection.start(event.downPoint);
				return;
			}
				
			if ((hitResult.type === "fill" || doubleClicked) && itemIsPath(hitResult.item)) {

				hitType = "fill";
				if (hitResult.item.selected) {
					if (event.modifiers.shift) {
						hitResult.item.fullySelected = false;
					}
					if (doubleClicked) {
						hitResult.item.selected = false;
						hitResult.item.fullySelected = true;
					}

				} else {
					if (event.modifiers.shift) {
						hitResult.item.fullySelected = true;
					} else {
						paper.project.deselectAll();
						hitResult.item.fullySelected = true;
					}
				}

			} else if (hitResult.type === "segment") {
				hitType = "point";
				if (event.modifiers.shift) {
					hitResult.segment.selected = true;
				} else {
					paper.project.deselectAll();
					hitResult.segment.selected = true;
				}
			} else if (hitResult.type === "stroke" || hitResult.type === "curve") {
				hitType = "curve";

				const curve = hitResult.location.curve;
				if (event.modifiers.shift) {
					curve.selected = !curve.selected;
				} else if (!curve.selected) {
					paper.project.deselectAll();
					curve.selected = true;
				}
			} else if (hitResult.type === "handle-in" || hitResult.type === "handle-out") {
				hitType = hitResult.type;

				if (!event.modifiers.shift) {
					paper.project.deselectAll();
				}
				
				hitResult.segment.handleIn.selected = true;
				hitResult.segment.handleOut.selected = true;
			}
		});
		
		on("mousemove", event => {
			hover.handleHoveredItem({ ...hitOptions, tolerance: 6 / paper.view.zoom }, event);
		});
		
		on("mousedrag", event => {
			if (event.event.button > 0) return; // only first mouse button
			
			if (mode === "select") {
				rectSelection.update(event.point, event.downPoint);
				notifyViewChanged(paper);
			} else {
				mode = "move";
				
				const selectedItems = selection.getSelectedItems() as paper.Path[];
				const dragVector = event.point.subtract(event.downPoint);
				
				for (const item of selectedItems) {

					if (hitType === "fill" || !("segments" in item)) {
						
						// if the item has a compound path as a parent, don't move its
						// own item, as it would lead to double movement
						if (item.parent && compoundPath.isCompoundPath(item.parent)) {
							continue;
						}
						
						// add the position of the item before the drag started
						// for later use in the snap calculation
						if (!origPositions.has(item)) {
							origPositions.set(item, item.position.clone());
						}
						const origPos = origPositions.get(item);

						if (event.modifiers.shift) {
							item.position = origPos.add(
								math.snapDeltaToAngle(dragVector, Math.PI*2/8)
							);
						} else {
							item.position = item.position.add(event.delta);
						}

					} else {
						for (const seg of item.segments) {
							// add the point of the segment before the drag started
							// for later use in the snap calculation
							if (!origPositions.has(seg)) {
								origPositions.set(seg, seg.point.clone());
							}
							const origPoint = origPositions.get(seg);

							if (seg.selected && (hitType === "point" || hitType === "curve")) {

								if (hitType !== "point" || event.modifiers.shift) {
									seg.point = seg.point.add(event.delta);
								} else {
									const newPoint = origPoint.add(dragVector);
									snapHitOptions.tolerance = 10 / paper.view.zoom;
									snapHitOptions.match = hit => hit.item !== item;
									const snapTarget = paper.project.hitTest(newPoint, snapHitOptions);
									if (snapTarget) {
										seg.point = snapTarget.point;
									} else {
										seg.point = newPoint;
									}
								}

							} else if (seg.handleOut.selected && hitType === "handle-out"){
								// if option is pressed or handles have been split, 
								// they're no longer parallel and move independently
								if (event.modifiers.option || !seg.handleOut.isCollinear(seg.handleIn)) {
									seg.handleOut = seg.handleOut.add(event.delta);
								} else {
									seg.handleIn = seg.handleIn.subtract(event.delta);
									seg.handleOut = seg.handleOut.add(event.delta);
								}
							} else if (seg.handleIn.selected && hitType === "handle-in") {
								// if option is pressed or handles have been split, 
								// they're no longer parallel and move independently
								if (event.modifiers.option || !seg.handleOut.isCollinear(seg.handleIn)) {
									seg.handleIn = seg.handleIn.add(event.delta);
								} else {
									seg.handleIn = seg.handleIn.add(event.delta);
									seg.handleOut = seg.handleOut.subtract(event.delta);
								}	
							}
						}
						
					}
				}
			}
		});

		on("mouseup", event => {
			if (event.event.button > 0) return; // only first mouse button
		
			if (mode === "select") {
				selection.processRectangularSelection(event.event.shiftKey, rectSelection.rect, "detail");
				rectSelection.end();
			} else {
				
				if (mode === "move") {
					undo.snapshot("moveSelection");
				}
				
				// resetting the items and segments origin points for the next usage
				const selectedItems = selection.getSelectedItems() as paper.Path[];

				for (const item of selectedItems) {
					// for the item
					origPositions.delete(item);
					// and for all segments of the item
					if (item.segments)
						for (const seg of item.segments)
							origPositions.delete(seg);
				}
			}
			
			mode = "none";
			
			updateWindow(true);
		});
		
		on("deactivate", () => {
			hover.clearHoveredItem();
		});

		const guideColor = "#59c99c";

		on("drawImmediate", ({ context }) => {
			const zoom = 1 / paper.view.zoom;
			if (rectSelection.rect) {	
				const { x, y, width, height } = rectSelection.rect;
				context.setLineDash([3 * zoom, 3 * zoom]);
				context.lineWidth = zoom;
				context.strokeStyle = guideColor;
				context.strokeRect(x, y, width, height);
				context.setLineDash([]);
			}
		});
	},
	
});

function itemIsPath(item: paper.Item): item is paper.Path {
	return item.className === "Path";
}
