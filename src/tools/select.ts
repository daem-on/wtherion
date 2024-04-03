// select tool
// adapted from resources on http://paperjs.org and 
// https://github.com/memononen/stylii

import { default as getSettings } from "../../src/objectSettings/model/getSettings";
import { updateWindow } from "../../src/objectSettings/objectOptionPanel";
import * as hover from "../hover";
import * as layer from "../layer";
import * as guides from "../guides";
import * as edit from "../edit";
import * as compoundPath from "../compoundPath";
import * as math from "../math";
import * as group from "../group";
import * as item from "../item";
import * as menu from "../menu";
import * as undo from "../undo";
import * as selection from "../selection";
import paper from "paper";
import LineSettings from "../../src/objectSettings/model/LineSettings";

/** Apparently paper's types are wrong and don't include Event.event */
export type correctToolEvent = paper.ToolEvent & {event: MouseEvent};

export default function() {
	let tool: paper.Tool;
	const keyModifiers: Record<string, boolean> = {};
			
	let boundsPath: paper.Path;
	const boundsScaleHandles = [];
	const boundsRotHandles = [];
		
	const options = {};
	
	const components = {};
	
	const menuEntries = {
		editTitle: {
			type : 'title',
			text : "%edit%"
		},
		copySelection: {
			type: 'button',
			label: "%copy%",
			click: 'pg.edit.copySelectionToClipboard'
		},
		pasteSelection: {
			type: 'button',
			label: "%paste%",
			click: 'pg.edit.pasteObjectsFromClipboard'
		},
		deleteSelection: {
			type: 'button',
			label: "%delete%",
			click: 'pg.selection.deleteSelection'
		},
		selectionTitle: {
			type : 'title',
			text : "%select%"
		},
		selectAll: {
			type: 'button',
			label: "%selectAll%",
			click: 'pg.selection.selectAllItems'
		},
		selectNone: {
			type: 'button',
			label: "%deselectAll%",
			click: 'pg.selection.clearSelection'
		},
		invertSelection: {
			type: 'button',
			label: "%invertSelection%",
			click: 'pg.selection.invertItemSelection'
		},
		areasTitle: {
			type: "title",
			text: "%area%"
		},
		lineToArea: {
			type: "button",
			label: "%lineToArea%",
			click: "pg.editTH2.lineToArea"
		},
		areaToLine: {
			type: "button",
			label: "%areaToLine%",
			click: "pg.editTH2.areaToLine"
		},
		lockArea: {
			type: "button",
			label: "%toggleItemsLocked%",
			click: "pg.editTH2.toggleItemsLocked"
		},
		orderTitle: {
			type : 'title',
			text : '%order%'
		},
		bringToFront: {
			type: 'button',
			label: '%bringToFront%',
			click: 'pg.order.bringSelectionToFront'
		},
		sendToBack: {
			type: 'button',
			label: '%sendToBack%',
			click: 'pg.order.sendSelectionToBack'
		},
		linesTitle: {
			type: 'title',
			text: '%linesTitle%',
		},
		mergeLines: {
			type: 'button',
			label: '%mergeLines%',
			click: 'pg.editTH2.mergeLines'
		},
		smoothLine: {
			type: 'button',
			label: '%smoothLine%',
			click: 'pg.editTH2.smooth'
		},
		simplifyLine: {
			type: 'button',
			label: '%simplifyLine%',
			click: 'pg.editTH2.simplify'
		},
		pointsTitle: {
			type: 'title',
			text: '%pointsTitle%',
		},
		randomizeRotation: {
			type: "button",
			label: "%randomizeRotation%",
			click: "pg.editTH2.randomizeRotation"
		},
		changeNamespace: {
			type: "button",
			label: "%edit.changeNamespace%",
			click: "pg.editTH2.changeStationsNamespace"
		}
	};

	const activateTool = function() {		
		setSelectionBounds();
		preProcessSelection();
		setSelectionBounds();
		tool = new paper.Tool();

		const hitOptions = {
			segments: true,
			stroke: true,
			curves: true,
			fill: true,
			guide: false,
			tolerance: 8 / paper.view.zoom
		};

		type selectToolMode = 
			"none" | "scale" | "rotate" | "move" | "cloneMove" | "rectSelection";
		let mode: selectToolMode = 'none';
		let selectionRect: paper.Path;

		let itemGroup: paper.Group;
		let pivot: paper.Point;
		let corner: paper.Point;
		let origPivot: paper.Point;
		let origSize: paper.Point;
		let origCenter: paper.Point;
		let scaleItems: paper.Item[];
		
		let rotItems: paper.Item[] = [];
		let rotGroupPivot: paper.Point;
		const prevRot: number[] = [];

		tool.onMouseDown = function(event: correctToolEvent) {
			if(event.event.button > 0) return;  // only first mouse button
			hover.clearHoveredItem();
			
			const hitResult = paper.project.hitTest(event.point, hitOptions);
			hit: if (hitResult) {
				
				if(hitResult.item.data?.isScaleHandle) {
					mode = 'scale';
					const index = hitResult.item.data.index;

					pivot = boundsPath.bounds[getOpposingRectCornerNameByIndex(index)].clone();
					origPivot = boundsPath.bounds[getOpposingRectCornerNameByIndex(index)].clone();
					corner = boundsPath.bounds[getRectCornerNameByIndex(index)].clone();
					origSize = corner.subtract(pivot);
					origCenter = boundsPath.bounds.center;
					scaleItems = selection.getSelectedItems();
					
				} else if(hitResult.item.data?.isRotHandle) {
					mode = 'rotate';
					if (boundsPath)
						rotGroupPivot = boundsPath.bounds.center;
					else
						rotGroupPivot = selection.getSelectedItems()[0].position;
					rotItems = selection.getSelectedItems();
					
					jQuery.each(rotItems, function(i, item) {
						prevRot[i] = event.point.subtract(rotGroupPivot).angle;
					});
										
				} else {
					if (hitResult.item.layer !== paper.project.activeLayer) break hit;
					// deselect all by default if the shift key isn't pressed
					// also needs some special love for compound paths and groups,
					// as their children are not marked as "selected"
					if(!event.modifiers.shift) {
						const root = item.getRootItem(hitResult.item);
						if(item.isCompoundPathItem(root) || group.isGroup(root)) {
							if(!root.selected) {
								selection.clearSelection();
							}
						} else if(!hitResult.item.selected) {
							selection.clearSelection();
						}
					}
					// deselect a currently selected item if shift is pressed
					if(event.modifiers.shift && hitResult.item.selected) {
						selection.setItemSelection(hitResult.item, false);

					} else {
						selection.setItemSelection(hitResult.item, true);

						if(event.modifiers.alt) {
							mode = 'cloneMove';
							selection.cloneSelection();

						} else {
							mode = 'move';
						}

						// // Use this for selection and moving being separate clicks
						// if (hitResult.item.selected) {
						// 	if(event.modifiers.alt) {
						// 		mode = 'cloneMove';
						// 		selection.cloneSelection();
						// 	} else mode = 'move';
						// } else selection.setItemSelection(hitResult.item, true);
					}
				}
				// while transforming object, never show the bounds stuff
				removeBoundsPath();
				return;
			}
			// else:

			if (!event.modifiers.shift) {
				removeBoundsPath();
				selection.clearSelection();
			}
			mode = 'rectSelection';
		};

		tool.onMouseMove = function(event: correctToolEvent) {			
			hover.handleHoveredItem(hitOptions, event);
		};

		
		tool.onMouseDrag = function(event: correctToolEvent) {
			if(event.event.button > 0) return; // only first mouse button
			
			let modOrigSize = origSize;
			
			if(mode === 'rectSelection') {
				selectionRect = guides.rectSelect(event);
				// Remove this rect on the next drag and up event
				selectionRect.removeOnDrag();

			} else if(mode === 'scale') {
				if (itemGroup == null) {
					itemGroup = new paper.Group(scaleItems);
					itemGroup.addChild(boundsPath);
					itemGroup.data.isHelperItem = true;
					itemGroup.strokeScaling = false;
					itemGroup.applyMatrix = false;
				} else {
					itemGroup.matrix = new paper.Matrix();
				}

				if (event.modifiers.alt) {
					pivot = origCenter;
					modOrigSize = origSize.multiply(0.5);
				} else {
					pivot = origPivot; 
				}

				corner = corner.add(event.delta);
				const size = corner.subtract(pivot);
				let sx = 1.0, sy = 1.0;
				if (Math.abs(modOrigSize.x) > 0.0000001) {
					sx = size.x / modOrigSize.x;
				}
				if (Math.abs(modOrigSize.y) > 0.0000001) {
					sy = size.y / modOrigSize.y;
				}

				if (event.modifiers.shift) {
					const signx = sx > 0 ? 1 : -1;
					const signy = sy > 0 ? 1 : -1;
					sx = sy = Math.max(Math.abs(sx), Math.abs(sy));
					sx *= signx;
					sy *= signy;
				}

				itemGroup.scale(sx, sy, pivot);
				
				jQuery.each(boundsScaleHandles, function(index, handle) {
					handle.position = itemGroup.bounds[getRectCornerNameByIndex(index)];
					handle.bringToFront();
				});
				
				jQuery.each(boundsRotHandles, function(index, handle) {
					if(handle) {
						handle.position = itemGroup.bounds[getRectCornerNameByIndex(index)].add(handle.data.offset);
						handle.bringToFront();
					}
				});
				
			} else if(mode === 'rotate') {
				let rotAngle = (event.point.subtract(rotGroupPivot)).angle;
				
				jQuery.each(rotItems, function(i, item) {
					
					if(!item.data.origRot) {
						item.data.origRot = item.rotation;
					}
					
					if(event.modifiers.shift) {
						rotAngle = Math.round(rotAngle / 45) *45;
						item.applyMatrix = false;
						item.pivot = rotGroupPivot;
						item.rotation = rotAngle;
						
					} else {
						item.rotate(rotAngle - prevRot[i], rotGroupPivot);
					}
					prevRot[i] = rotAngle;
				});
				
			} else if(mode === 'move' || mode === 'cloneMove') {
				
				const dragVector = (event.point.subtract(event.downPoint));
				const selectedItems = selection.getSelectedItems();

				for(let i=0; i<selectedItems.length; i++) {
					const item = selectedItems[i];
					// add the position of the item before the drag started
					// for later use in the snap calculation
					if(!item.data.origPos) {
						item.data.origPos = item.position;
					}

					if (event.modifiers.shift) {
						item.position = item.data.origPos.add(
							math.snapDeltaToAngle(dragVector, Math.PI*2/8)
						);

					} else {
						item.position = item.position.add(event.delta);
					}
				}
			}
		};

		tool.onMouseUp = function(event: correctToolEvent) {
			if(event.event.button > 0) return; // only first mouse button
			
			if(mode === 'rectSelection' && selectionRect) {
				selection.processRectangularSelection(event, selectionRect);
				selectionRect.remove();
				
			} else if(mode === 'move' || mode === 'cloneMove') {
				
				// resetting the items origin point for the next usage
				const selectedItems = selection.getSelectedItems();

				jQuery.each(selectedItems, function(index, item) {
					// remove the orig pos again
					item.data.origPos = null;			
				});
				undo.snapshot('moveSelection');
				
			} else if(mode === 'scale') {
				// this means the original setting is lost, but whatever
				itemGroup.strokeScaling = true;
				itemGroup.applyMatrix = true;
				
				// mark text items as scaled (for later use on font size calc)
				for(let i=0; i<itemGroup.children.length; i++) {
					const child = itemGroup.children[i];
					if(child.data.isPGTextItem) {
						child.data.wasScaled = true;
					} else if (child.data.fixedScale) {
						const old = new paper.Matrix(child.matrix);
						child.matrix = new paper.Matrix();
						child.rotation = old.rotation;
						child.position = old.translation;
						
						child.scaling = new paper.Point(1, 1);
					}
				}
				
				itemGroup.layer.addChildren(itemGroup.children);
				itemGroup.remove();
				itemGroup = null;
				undo.snapshot('scaleSelection');
				
			} else if(mode === 'rotate') {
				jQuery.each(rotItems, function(i, item) {
					item.applyMatrix = true;
				});
				undo.snapshot('rotateSelection');
			}
			
			mode = 'none';
			selectionRect = null;
			
			if(selection.getSelectedItems().length <= 0) {
				removeBoundsPath();
			} else {
				setSelectionBounds();
			}
		};
		
		tool.onKeyDown = function(event: paper.KeyEvent) {
			keyModifiers[event.key] = true;
		};
		
		tool.onKeyUp = function(event: paper.KeyEvent) {
			
			if(keyModifiers.control && keyModifiers.shift) {
				if (event.key === 'g') {
					group.ungroupSelection();
				}
				
			} else if (keyModifiers.control
				&& document.activeElement.tagName !== 'INPUT') {
				if(event.key === 'a') {
					selection.selectAllItems();
				} else if(event.key === 'i') {
					selection.invertItemSelection();
				} else if(event.key === 'g') {
					group.groupSelection();
				} else if(event.key === 'c') {
					edit.copySelectionToClipboard();
				} else if(event.key === 'v') {
					edit.pasteObjectsFromClipboard();
				}	
			}
			
			keyModifiers[event.key] = false;
		};
		
		jQuery(document).on('DeleteItems Undo Redo Grouped Ungrouped SelectionChanged', function(){
			setSelectionBounds();
			updateWindow();
		});
		
		// setup floating tool options panel in the editor
		//pg.toolOptionPanel.setup(options, components, function(){ });
		
		menu.setupToolEntries(menuEntries);
		
		tool.activate();
	};


	const deactivateTool = function() {
		hover.clearHoveredItem();
		removeBoundsPath();
		menu.clearToolEntries();
		jQuery(document).off('DeleteItems Undo Redo Grouped Ungrouped SelectionChanged');
	};
	
	
	const setSelectionBounds = function() {
		removeBoundsPath();
		
		const items = selection.getSelectedItems();
		if(items.length <= 0) return;

		// If there are items with noDrawHandle, don't draw regular handles
		if (items.some(item => (item.data?.noDrawHandle))) {
			return;
		}
		
		if (items.length === 1 && items[0].data?.onlyRotateHandle) {
			showRotateHandle(items[0]);
			return;
		}

		if (items.length === 1 && item.isPathItem(items[0])) {
			const settings = getSettings(items[0]);
			if (settings.className === "LineSettings")
				showLineDirectionTick(items[0], settings);
		}

		let rect: paper.Rectangle;
		jQuery.each(items, function(index, item) {
			if(rect) {
				rect = rect.unite(item.bounds);
			} else {
				rect = item.bounds;
			}
		});
		
		if(!boundsPath) {
			boundsPath = new paper.Path.Rectangle(rect);
			boundsPath.curves[0].divideAtTime(0.5);
			boundsPath.curves[2].divideAtTime(0.5);
			boundsPath.curves[4].divideAtTime(0.5);
			boundsPath.curves[6].divideAtTime(0.5);
		}
		boundsPath["guide"] = true;
		boundsPath.data.isSelectionBound = true;
		boundsPath.data.isHelperItem = true;
		boundsPath.fillColor = null;
		boundsPath.strokeScaling = false;
		boundsPath.fullySelected = true;
		boundsPath.parent = layer.getGuideLayer() || null;
		
		jQuery.each(boundsPath.segments, function(index: number, segment) {
			let size = 4;
			
			if(index%2 === 0) {
				size = 6;
			}
			
			if(index === 7) {
				const offset = new paper.Point(0, 10/paper.view.zoom);
				boundsRotHandles[index] =
				new paper.Path.Circle({
					center: segment.point.add(offset),
					data: {
						offset: offset,
						isRotHandle: true,
						isHelperItem: true,
						noSelect: true,
						noHover: true
					},
					radius: 5 / paper.view.zoom,
					strokeColor: guides.getGuideColor('blue'),
					fillColor: 'white',
					strokeWidth: 0.5 / paper.view.zoom,
					parent: layer.getGuideLayer()
				});
			}
			
			boundsScaleHandles[index] =
				new paper.Path.Rectangle({
					center: segment.point,
					data: {
						index:index,
						isScaleHandle: true,
						isHelperItem: true,
						noSelect: true,
						noHover: true
					},
					size: [size/paper.view.zoom,size/paper.view.zoom],
					fillColor: guides.getGuideColor('blue'),
					parent: layer.getGuideLayer()
				});
		});
	};	

	
	const removeBoundsPath = function() {
		guides.removeHelperItems();
		boundsPath = null;
		boundsScaleHandles.length = 0;
		boundsRotHandles.length = 0;
	};
	
	return {
		options: options,
		activateTool: activateTool,
		deactivateTool: deactivateTool
	};
	
}

function preProcessSelection() {
	
	// when switching to the select tool while having a child object of a
	// compound path selected, deselect the child and select the compound path
	// instead. (otherwise the compound path breaks because of scale-grouping)
	const items = selection.getSelectedItems();
	jQuery.each(items, function(index, item) {
		if(compoundPath.isCompoundPathChild(item)) {
			const cp = compoundPath.getItemsCompoundPath(item);
			selection.setItemSelection(item, false);
			selection.setItemSelection(cp, true);
		}
	});
}


function getRectCornerNameByIndex(index: number) {
	switch(index) {
		case 0: return 'bottomLeft';
		case 1: return 'leftCenter';
		case 2: return 'topLeft';
		case 3: return 'topCenter';
		case 4: return 'topRight';
		case 5: return 'rightCenter';
		case 6: return 'bottomRight';
		case 7: return 'bottomCenter';
	}
}

function getOpposingRectCornerNameByIndex(index: number) {
	switch(index) {
		case 0: return 'topRight';
		case 1: return 'rightCenter';
		case 2: return 'bottomRight';
		case 3: return 'bottomCenter';
		case 4: return 'bottomLeft';
		case 5: return 'leftCenter';
		case 6: return 'topLeft';
		case 7: return 'topCenter';
	}
}

function showLineDirectionTick(line: paper.Path, settings: LineSettings) {
	if (line.segments.length < 2) return;
	const reverse = settings.reverse ? -1 : 1;
	const normal = line.getNormalAt(0).multiply(10 * reverse);
	const directionIndicator = new paper.Path([
		line.firstSegment.point,
		line.firstSegment.point.add(normal)
	]);
	directionIndicator.strokeColor = new paper.Color("#fcba03");
	directionIndicator.data.isHelperItem = true;
	directionIndicator["guide"] = true;
	directionIndicator.parent = layer.getGuideLayer() || null;
}

function showRotateHandle(item: paper.Item) {
	const thPointRotHandle =
		new paper.Path.Line({
			data: {
				isRotHandle: true,
				isHelperItem: true,
				noSelect: true,
				noHover: true
			},
			from: item.position
				.subtract(new paper.Point(0, 6)),
			to: item.position
				.subtract(new paper.Point(0, 10 + (paper.view.zoom / 60))),
			strokeColor: guides.getGuideColor('blue'),
			strokeWidth: 4 / paper.view.zoom,
			parent: layer.getGuideLayer()
		});
	thPointRotHandle.rotate(item.rotation, item.position);
}

