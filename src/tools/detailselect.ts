// select tool
// adapted from resources on http://paperjs.org and 
// https://github.com/memononen/stylii
import { updateWindow } from "../../src/objectSettings/objectOptionPanel";
import paper from "paper";
import * as hover from "../hover";
import * as guides from "../guides";
import * as compoundPath from "../compoundPath";
import * as math from "../math";
import * as undo from "../undo";
import * as selection from "../selection";
import { defineTool } from "../tools";
import { ToolAction } from "../toolMenu";
import selectAllUrl from "../../assets/ui/select_all.svg";
import linearScaleUrl from "../../assets/ui/linear_scale.svg";
import callSplitUrl from "../../assets/ui/call_split.svg";
import deleteUrl from "../../assets/ui/delete.svg";

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
		let doRectSelection = false;
		let selectionRect: paper.Path.Rectangle;
		
		let hitType: "fill" | "point" | "curve" | "handle-in" | "handle-out" | null = null;
		
		let lastEvent = null;
		let selectionDragged = false;

		const origPositions = new Map<paper.Item | paper.Segment, paper.Point>();

		on("activate", () => {});

		on("mousedown", event => {
			if (event.event.button > 0) return; // only first mouse button
			
			selectionDragged = false;
			
			let doubleClicked = false;
			
			if (lastEvent) {
				if ((event.event.timeStamp - lastEvent.event.timeStamp) < 250) {
					doubleClicked = true;
					if (!event.modifiers.shift) {
						selection.clearSelection();
					}
				} else {
					doubleClicked = false;
				}
			}
			lastEvent = event;
			
			hitType = null;
			hover.clearHoveredItem();
			hitOptions.tolerance = 6 / paper.view.zoom;
			const hitResult = paper.project.hitTest(event.point, hitOptions);
			if (!hitResult) {
				if (!event.modifiers.shift) {
					selection.clearSelection();
				}
				doRectSelection = true;
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
			} else if (
				hitResult.type === "stroke" || 
				hitResult.type === "curve") {
				hitType = "curve";

				const curve = hitResult.location.curve;
				if (event.modifiers.shift) {
					curve.selected = !curve.selected;

				} else if (!curve.selected) {
					paper.project.deselectAll();
					curve.selected = true;
				}
			} else if (
				hitResult.type === "handle-in" || 
				hitResult.type === "handle-out") {
				hitType = hitResult.type;

				if (!event.modifiers.shift) {
					paper.project.deselectAll();
				}
				
				hitResult.segment.handleIn.selected = true;
				hitResult.segment.handleOut.selected = true;
			}
		});
		
		on("mousemove", event => {
			hover.handleHoveredItem(hitOptions, event);
		});
		
		on("mousedrag", event => {
			if (event.event.button > 0) return; // only first mouse button
			
			if (doRectSelection) {
				selectionRect = guides.rectSelect(event);
				// Remove this rect on the next drag and up event
				selectionRect.removeOnDrag();

			} else {
				doRectSelection = false;
				selectionDragged = true;
				
				const selectedItems = selection.getSelectedItems();
				const dragVector = (event.point.subtract(event.downPoint));
				
				for (let i=0; i < selectedItems.length; i++) {
					const item = selectedItems[i] as paper.Path;

					if (hitType === "fill" || !("segments" in item)) {
						
						// if the item has a compound path as a parent, don"t move its
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

							} else if (seg.handleOut.selected && 
								hitType === "handle-out"){
								//if option is pressed or handles have been split, 
								//they"re no longer parallel and move independently
								if (event.modifiers.option ||
									!seg.handleOut.isCollinear(seg.handleIn)) {
									seg.handleOut = seg.handleOut.add(event.delta);

								} else {
									seg.handleIn = seg.handleIn.subtract(event.delta);
									seg.handleOut = seg.handleOut.add(event.delta);
								}

							} else if (seg.handleIn.selected && 
								hitType === "handle-in") {

								//if option is pressed or handles have been split, 
								//they"re no longer parallel and move independently
								if (event.modifiers.option ||
									!seg.handleOut.isCollinear(seg.handleIn)) {
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
		
			if (doRectSelection && selectionRect) {
				selection.processRectangularSelection(event, selectionRect, "detail");
				selectionRect.remove();
				
			} else {
				
				if (selectionDragged) {
					undo.snapshot("moveSelection");
					selectionDragged = false;
				}
				
				// resetting the items and segments origin points for the next usage
				const selectedItems = selection.getSelectedItems();

				for (let i=0; i < selectedItems.length; i++) {
					const item = selectedItems[i] as paper.Path;
					// for the item
					origPositions.delete(item);
					// and for all segments of the item
					if (item.segments)
						for (const seg of item.segments)
							origPositions.delete(seg);
				}
			}
			
			doRectSelection = false;
			selectionRect = null;
			
			updateWindow(true);
		});
		
		on("deactivate", () => {
			hover.clearHoveredItem();
		});
	},
	
});

function itemIsPath(item: paper.Item): item is paper.Path {
	return item.className === "Path";
}
