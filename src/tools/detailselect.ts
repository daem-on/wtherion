// select tool
// adapted from resources on http://paperjs.org and 
// https://github.com/memononen/stylii
import { drawGuides, clearGuideNumbers, hideGuideNumbers } from "../../src/detailSelectGuides";
import { updateWindow } from "../../src/objectSettings/objectOptionPanel";
import paper from "paper";
import * as hover from "../hover";
import * as guides from "../guides";
import * as compoundPath from "../compoundPath";
import * as math from "../math";
import * as statusbar from "../statusbar";
import * as items from "../item";
import * as menu from "../menu";
import * as undo from "../undo";
import * as selection from "../selection";
import { defineTool } from "../tools";

const menuEntries = {
	selectionTitle: {
		type : 'title',
		text :'Selection'
	},
	selectAll: {
		type: 'button',
		label: 'Select all',
		click: 'pg.selection.selectAllSegments'
	},
	selectNone: {
		type: 'button',
		label: 'Deselect all',
		click: 'pg.selection.clearSelection'
	},
	invertSelection: {
		type: 'button',
		label: 'Invert selection',
		click: 'pg.selection.invertSegmentSelection'
	},
	segmentTitle: {
		type : 'title',
		text :'Segment'
	},
	switchHandles: {
		type: 'button',
		label: 'Toggle handles',
		click: 'pg.selection.switchSelectedHandles'
	},
	smoothHandles: {
		type: 'button',
		label: 'Reset handles to smooth',
		click: 'pg.selection.smoothHandles'
	},
	removeSegments: {
		type: 'button',
		label: 'Remove segments',
		click: 'pg.selection.removeSelectedSegments'
	},
	splitPath: {
		type: 'button',
		label: 'Split path',
		click: 'pg.selection.splitPathAtSelectedSegments'
	},
	testTitle: {
		type : 'title',
		text :'Lines'
	},
	test5: {
		type: 'button',
		label: 'Merge lines',
		click: 'pg.editTH2.mergeLines'
	},
};

export const detailselect = defineTool({
	definition: {
		id: 'detailselect',
		name: '%tools.detailSelect%',
		options: {},
	},
	setup(on) {
		const keyModifiers: Record<string, boolean> = {};
		
		const hitOptions = {
			segments: true,
			stroke: true,
			curves: true,
			handles: true,
			fill: true,
			guide: false,
			tolerance: 3 / paper.view.zoom
		};
		
		let doRectSelection = false;
		let selectionRect;
		
		let hitType;
		
		let lastEvent = null;
		let selectionDragged = false;

		on("activate", () => {		
			
			// setup floating tool options panel in the editor
			//toolOptionPanel.setup(options, components, function(){ });
			
			menu.setupToolEntries(menuEntries);
		});

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
			const hitResult = paper.project.hitTest(event.point, hitOptions);
			if (!hitResult || (hitResult.item.layer !== paper.project.activeLayer)) {
				if (!event.modifiers.shift) {
					selection.clearSelection();
				}
				doRectSelection = true;
				return;
			}
			
			// dont allow detail-selection of PGTextItem
			if (hitResult && items.isPGTextItem(items.getRootItem(hitResult.item))) {
				return;
			}
				
			if ((hitResult.type === 'fill' || doubleClicked) && itemIsPath(hitResult.item)) {

				hitType = 'fill';
				if (hitResult.item.selected) {
					if (event.modifiers.shift) {
						hitResult.item.fullySelected = false;
					}
					if (doubleClicked) {
						hitResult.item.selected = false;
						hitResult.item.fullySelected = true;
					}
					// if(event.modifiers.option) pg.selection.cloneSelection();

				} else {
					if (event.modifiers.shift) {
						hitResult.item.fullySelected = true;
					} else {
						paper.project.deselectAll();
						hitResult.item.fullySelected = true;


						// if(event.modifiers.option) pg.selection.cloneSelection();
					}
				}

			} else if (hitResult.type === 'segment') {
				hitType = 'point';

				// // we could use this but not right now
				// if(hitResult.segment.selected) {
				// 	// selected points with no handles get handles if selected again
				// 	hitResult.segment.selected = true;
				// 	if(event.modifiers.shift) {
				// 		hitResult.segment.selected = false;
				// 	}

				// } else
				{
					if (event.modifiers.shift) {
						hitResult.segment.selected = true;
					} else {
						paper.project.deselectAll();
						hitResult.segment.selected = true;
					}
				}
				
				// if(event.modifiers.option) pg.selection.cloneSelection();


			} else if (
				hitResult.type === 'stroke' || 
				hitResult.type === 'curve') {
				hitType = 'curve';

				const curve = hitResult.location.curve;
				if (event.modifiers.shift) {
					curve.selected = !curve.selected;

				} else if (!curve.selected) {
					paper.project.deselectAll();
					curve.selected = true;
				}

				// if(event.modifiers.option) pg.selection.cloneSelection();

			} else if (
				hitResult.type === 'handle-in' || 
				hitResult.type === 'handle-out') {
				hitType = hitResult.type;

				if (!event.modifiers.shift) {
					paper.project.deselectAll();
				}
				
				hitResult.segment.handleIn.selected = true;
				hitResult.segment.handleOut.selected = true;
			}
			
			statusbar.update();
			hideGuideNumbers();
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
					const item = selectedItems[i] as
						paper.Path & {origPos?: paper.Point};

					if (hitType === 'fill' || !("segments" in item)) {
						
						// if the item has a compound path as a parent, don't move its
						// own item, as it would lead to double movement
						if (item.parent && compoundPath.isCompoundPath(item.parent)) {
							continue;
						}
						
						// add the position of the item before the drag started
						// for later use in the snap calculation
						if (!item.origPos) {
							item.origPos = item.position;
						}

						if (event.modifiers.shift) {
							item.position = item.origPos.add(
								math.snapDeltaToAngle(dragVector, Math.PI*2/8)
							);

						} else {
							item.position = item.position.add(event.delta);
						}

					} else {
						for (let j=0; j < item.segments.length; j++) {
							const seg = item.segments[j] as
								paper.Segment & {origPoint?: paper.Point};
							// add the point of the segment before the drag started
							// for later use in the snap calculation
							if (!seg.origPoint) {
								seg.origPoint = seg.point.clone();
							}

							if (seg.selected && (
								hitType === 'point' || 
								hitType === 'stroke' || 
								hitType === 'curve')){

								if (event.modifiers.shift) {
									seg.point = seg.origPoint.add(
										math.snapDeltaToAngle(dragVector, Math.PI*2/8)
									);

								} else {
									seg.point = seg.point.add(event.delta);
								}

							} else if (seg.handleOut.selected && 
								hitType === 'handle-out'){
								//if option is pressed or handles have been split, 
								//they're no longer parallel and move independently
								if (event.modifiers.option ||
									!seg.handleOut.isCollinear(seg.handleIn)) {
									seg.handleOut = seg.handleOut.add(event.delta);

								} else {
									seg.handleIn = seg.handleIn.subtract(event.delta);
									seg.handleOut = seg.handleOut.add(event.delta);
								}

							} else if (seg.handleIn.selected && 
								hitType === 'handle-in') {

								//if option is pressed or handles have been split, 
								//they're no longer parallel and move independently
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
				selection.processRectangularSelection(event, selectionRect, 'detail');
				selectionRect.remove();
				
			} else {
				
				if (selectionDragged) {
					undo.snapshot('moveSelection');
					selectionDragged = false;
				}
				
				// resetting the items and segments origin points for the next usage
				const selectedItems = selection.getSelectedItems();

				for (let i=0; i < selectedItems.length; i++) {
					const item = selectedItems[i] as
						paper.Path & {origPos?: paper.Point};
					// for the item
					item.origPos = null;
					// and for all segments of the item
					if (item.segments) {
						for (let j=0; j < item.segments.length; j++) {
							const seg = item.segments[j] as 
								paper.Segment & {origPoint?: paper.Point};
								seg.origPoint = null;
						}
					}
				}
			}
			
			doRectSelection = false;
			selectionRect = null;
			
			updateWindow();
			drawGuides();
		});
		
		on("keydown", (event: paper.KeyEvent) => {
			keyModifiers[event.key] = true;
		});
		
		on("keyup", (event: paper.KeyEvent) => {
			if (keyModifiers.control) {
				if (event.key === 'a') {
					selection.selectAllSegments();
				} else if (event.key === 'i') {
					selection.invertSegmentSelection();
				}
			}
			keyModifiers[event.key] = false;
		});
		
		on("deactivate", () => {
			hover.clearHoveredItem();
			menu.clearToolEntries();
			clearGuideNumbers();
		});
	},
	
});

function itemIsPath(item: paper.Item): item is paper.Path {
	return item.className === 'Path';
} 