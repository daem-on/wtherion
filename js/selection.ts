// functions related to selecting stuff
import pg from "../src/init";
import paper from "paper";

export function getSelectionMode() {
	var activeTool = pg.toolbar.getActiveTool();
	if(activeTool) {
		var activeToolID = activeTool.options.id;
		if(activeToolID === 'detailselect') {
			return 'Segment';
		} else {
			return 'Item';
		}
	}
};


export function selectAllItems() {
	var items = pg.document.getAllSelectableItems();
	
	for(var i=0; i<items.length; i++) {
		setItemSelection(items[i], true);
	}
};


export function selectRandomItems() {
	var items = pg.document.getAllSelectableItems();
	
	for(var i=0; i<items.length; i++) {
		if(pg.math.getRandomBoolean()) {
			setItemSelection(items[i], true);
		}
	}
};




export function selectAllSegments() {
	var items = pg.document.getAllSelectableItems();
	
	for(var i=0; i<items.length; i++) {
		selectItemSegments(items[i], true);
	}
};


export function selectItemSegments(item, state) {
	if(item.children) {
		for(var i=0; i<item.children.length; i++) {
			var child = item.children[i];
			if(child.children && child.children.length > 0) {
				selectItemSegments(child, state);
			} else {
				child.fullySelected = state;
			}
		}
		
	} else {
		for(var i=0; i<item.segments.length; i++) {
			item.segments[i].selected = state;
		}
	}
};


export function clearSelection() {
	paper.project.deselectAll();
	pg.stylebar.sanitizeSettings();
	
	pg.statusbar.update();
	pg.stylebar.blurInputs();
	pg.hover.clearHoveredItem();
	jQuery(document).trigger('SelectionChanged');
};


export function invertItemSelection() {
	var items = pg.document.getAllSelectableItems();
	
	for(var i=0; i<items.length; i++) {
		items[i].selected = !items[i].selected;
	}
	
	jQuery(document).trigger('SelectionChanged');
};


export function invertSegmentSelection() {
	var items = pg.document.getAllSelectableItems();
	
	for(var i=0; i<items.length; i++) {
		var item = items[i];
		for(var j=0; j<item.segments.length; j++) {
			var segment = item.segments[j];
			segment.selected = !segment.selected;
		}
	}
	
	//jQuery(document).trigger('SelectionChanged');
};


export function deleteSelection() {
	var selectionMode = getSelectionMode();
	
	if(selectionMode === 'Segment') {
		deleteSegmentSelection();
	} else {
		deleteItemSelection();
	}
};


export function deleteItemSelection() {
	var items = getSelectedItems();
	for(var i=0; i<items.length; i++) {
		items[i].remove();
	}
	
	jQuery(document).trigger('DeleteItems');
	jQuery(document).trigger('SelectionChanged');
	paper.project.view.update();
	pg.undo.snapshot('deleteItemSelection');
};


export function deleteSegmentSelection() {
	
	var items = getSelectedItems();
	for(var i=0; i<items.length; i++) {
		deleteSegments(items[i]);
	}
	
	jQuery(document).trigger('DeleteSegments');
	jQuery(document).trigger('SelectionChanged');
	paper.project.view.update();
	pg.undo.snapshot('deleteSegmentSelection');
};


export function deleteSegments(item) {
	if(item.children) {
		for(var i=0; i<item.children.length; i++) {
			var child = item.children[i];
			deleteSegments(child);
		}
	} else {
		var segments = item.segments;
		for(var j=0; j<segments.length; j++) {
			var segment = segments[j];
			if(segment.selected) {
				if(item.closed ||
					(segment.next && 
					!segment.next.selected &&
					segment.previous &&
					!segment.previous.selected) ) {

					splitPathRetainSelection(item, j);
					deleteSelection();
					return;

				} else if(!item.closed) {
					segment.remove();
					j--; // decrease counter if we removed one from the loop
				}

			}
		}
	}
	// remove items with no segments left
	if(item.segments.length <= 0) {
		item.remove();
	}
};


export function splitPathAtSelectedSegments() {
	var items = getSelectedItems() as paper.Path[];
	for(var i=0; i<items.length; i++) {
		var item = items[i];
		var segments = item.segments;
		for(var j=0; j<segments.length; j++) {
			var segment = segments[j];
			if(segment.selected) {
				if(item.closed ||
					(segment.next && 
					!segment.next.selected &&
					segment.previous &&
					!segment.previous.selected) ) {
					splitPathRetainSelection(item, j, true);
					splitPathAtSelectedSegments();
					return;
				}
			}
		}
	}
};

export function splitPathRetainSelection(path: paper.Path, index: number, deselectSplitSegments?: boolean): void {
	var selectedPoints = [];
	
	// collect points of selected segments, so we can reselect them
	// once the path is split.
	for(var i=0; i<path.segments.length; i++) {
		var seg = path.segments[i];
		if(seg.selected) {
			if(deselectSplitSegments && i === index) {
				continue;
			}
			selectedPoints.push(seg.point);
		}
	}
	
	var newPath = path.splitAt(index);
	if(!newPath) return;
	if (path.data && path.data.therionData)
			newPath.data = JSON.parse(JSON.stringify(path.data))
	
	// reselect all of the newPaths segments that are in the exact same location
	// as the ones that are stored in selectedPoints
	for(var i=0; i<newPath.segments.length; i++) {
		var seg = newPath.segments[i];
		for(var j=0; j<selectedPoints.length; j++) {
			var point = selectedPoints[j];
			if(point.x === seg.point.x && point.y === seg.point.y) {
				seg.selected = true;
			}
		}
	}
	
	// only do this if path and newPath are different
	// (split at more than one point)
	if(path !== newPath) {
		for(var i=0; i<path.segments.length; i++) {
			var seg = path.segments[i];
			for(var j=0; j<selectedPoints.length; j++) {
				var point = selectedPoints[j];
				if(point.x === seg.point.x && point.y === seg.point.y) {
					seg.selected = true;
				}
			}
		}
	}
};


export function cloneSelection() {
	var selectedItems = getSelectedItems();
	for(var i = 0; i < selectedItems.length; i++) {
		var item = selectedItems[i];
		var cloned = item.clone();
		if (item.data && item.data.therionData)
			cloned.data = JSON.parse(JSON.stringify(item.data))
		item.selected = false;
	}
	pg.undo.snapshot('cloneSelection');

};


export function setItemSelection(item, state) {
	if (item.layer != paper.project.activeLayer) return;
	var parentGroup = pg.group.getItemsGroup(item);
	var itemsCompoundPath = pg.compoundPath.getItemsCompoundPath(item);
	
	// if selection is in a group, select group not individual items
	if(parentGroup) {
		// do it recursive
		setItemSelection(parentGroup, state);

	} else if(itemsCompoundPath) {
		setItemSelection(itemsCompoundPath, state);

	} else {
		if(item.data && item.data.noSelect) {
			return;
		}
		// fully selected segments need to be unselected first
		item.fullySelected = false; 
		// then the item can be normally selected
		item.selected = state;
		// deselect children of compound-path or group for cleaner item selection
		if(pg.compoundPath.isCompoundPath(item) || pg.group.isGroup(item)) {
			
			var children = item.children;
			if(children) {
				for(var i=0; i<children.length; i++) {
					var child = children[i];
					child.selected = !state;
				}
			}
		}
	}
	pg.statusbar.update();
	pg.stylebar.updateFromSelection();
	pg.stylebar.blurInputs();
	
	jQuery(document).trigger('SelectionChanged');
	
};


// this gets all selected non-grouped items and groups
// (alternative to paper.project.selectedItems, which includes 
// group children in addition to the group)
export function getSelectedItems() {
	var allItems = paper.project.selectedItems;
	var itemsAndGroups: paper.Item[] = [];

	for(var i=0; i<allItems.length; i++) {
		var item = allItems[i];
		if(pg.item.isLayer(item)) {
			continue;
		}
		if(pg.group.isGroup(item) &&
			!pg.group.isGroup(item.parent) ||
			!pg.group.isGroup(item.parent)) {
			if(item.data && !item.data.isSelectionBound) {
				itemsAndGroups.push(item);
			}
		}
	}
	// sort items by index (0 at bottom)
	itemsAndGroups.sort(function(a, b) {
			return a.index - b.index;
	});
	return itemsAndGroups;
};


export function getSelectionType() {
	var selection = getSelectedItems();
	if(selection.length === 0) {
		return false;
	}
	
	var selectionType = '';
	var lastSelectionType = '';
	for(var i=0; i<selection.length; i++) {
		var item = selection[i];
		if(getSelectionMode() === 'Segment') {
			//todo: differentiate between segment, curve and handle
			return 'Segment';
		}
		
		if(item.data.isPGTextItem) {
			selectionType = 'Text';
		} else {
			selectionType = item.className;
		}
		
		if(selectionType === lastSelectionType || lastSelectionType === '') {
			lastSelectionType = selectionType;
			
		} else {
			return 'Mixed';
		}
	}
	return selectionType;

};


// only returns paths, no compound paths, groups or any other stuff
export function getSelectedPaths(): paper.Path[] {
	var allPaths = getSelectedItems();
	var paths = [];

	for(var i=0; i<allPaths.length; i++) {
		var path = allPaths[i];
		if(path.className === 'Path') {
			paths.push(path);
		}
	}
	return paths;
};

export function smoothHandles() {
	switchSelectedHandles("smooth");
}

export function switchSelectedHandles(mode) {
	var items = getSelectedItems() as paper.Path[];
	for(var i=0; i<items.length; i++) {
		var segments = items[i].segments;
		for(var j=0; j<segments.length; j++) {
			var seg = segments[j];
			if(!seg.selected) continue;

			pg.geometry.switchHandle(seg, mode);
		}
	}
	pg.undo.snapshot('switchSelectedHandles');
};


export function removeSelectedSegments() {
	pg.undo.snapshot('removeSelectedSegments');
	
	var items = getSelectedItems() as paper.Path[];
	var segmentsToRemove: paper.Segment[] = [];
	
	for(var i=0; i<items.length; i++) {
		var segments = items[i].segments;
		for(var j=0; j < segments.length; j++) {
			var seg = segments[j];
			if(seg.selected) {
				segmentsToRemove.push(seg);
			}
		}
	}
	
	for(var i=0; i<segmentsToRemove.length; i++) {
		var seg = segmentsToRemove[i];
		seg.remove();
	}
};


export function processRectangularSelection(event: paper.Event, rect: paper.PathItem, mode?: string) {
	var allItems = pg.document.getAllSelectableItems();
	
	itemLoop:
	for(var i=0; i<allItems.length; i++) {
		var item = allItems[i];
		if(mode === 'detail' && pg.item.isPGTextItem(pg.item.getRootItem(item))) {
			continue itemLoop;
		}
		// check for item segment points inside selectionRect
		if(pg.group.isGroup(item) || pg.item.isCompoundPathItem(item)) {
			if(!rectangularSelectionGroupLoop(item, rect, item, event, mode)) {
				continue itemLoop;
			}
			
		} else {
			if(!handleRectangularSelectionItems(item, event, rect, mode)) {
				continue itemLoop;
			}
		}
	}
};


// if the rectangular selection found a group, drill into it recursively
export function rectangularSelectionGroupLoop(group: paper.Group | paper.CompoundPath, rect: paper.PathItem, root: paper.Group | paper.CompoundPath, event: paper.Event, mode?: string) {
	for(var i=0; i<group.children.length; i++) {
		var child = group.children[i];
		
		if(pg.group.isGroup(child) || pg.item.isCompoundPathItem(child)) {
			rectangularSelectionGroupLoop(child, rect, root, event, mode);
			
		} else {
			if(!handleRectangularSelectionItems(child, event, rect, mode)) {
				return false;
			}
		}
	}
	return true;
};


export function handleRectangularSelectionItems(item: paper.Item, event: paper.Event, rect: paper.PathItem, mode?: string) {
	if (item.layer != paper.project.activeLayer) return;
	if(pg.item.isPathItem(item)) {
		var segmentMode = false;
		
		// first round checks for segments inside the selectionRect
		for(var j=0; j<item.segments.length; j++) {
			var seg = item.segments[j];
			if( rect.contains(seg.point)) {
				if(mode === 'detail') {
					if(event.modifiers.shift && seg.selected) {
						seg.selected = false;
					} else {
						seg.selected = true;
					}
					segmentMode = true;

				} else {
					if(event.modifiers.shift && item.selected) {
						setItemSelection(item,false);

					} else {
						setItemSelection(item,true);
					}
					return false;
				}
			}
		}

		// second round checks for path intersections
		var intersections = item.getIntersections(rect);
		if( intersections.length > 0 && !segmentMode) {
			// if in detail select mode, select the curves that intersect
			// with the selectionRect
			if(mode === 'detail') {
				for(var k=0; k<intersections.length; k++) {
					var curve = intersections[k].curve;
					// intersections contains every curve twice because
					// the selectionRect intersects a circle always at
					// two points. so we skip every other curve
					if(k % 2 === 1) {
						continue;
					}

					if(event.modifiers.shift) {
						curve.selected = !curve.selected;
					} else {
						curve.selected = true;
					}
				}

			} else {
				if(event.modifiers.shift && item.selected) {
					setItemSelection(item,false);

				} else {
					setItemSelection(item,true);
				}
				return false;
			}
		}
		pg.statusbar.update();

	} else if(pg.item.isBoundsItem(item)) {
		if(checkBoundsItem(rect, item, event)) {
			return false;
		}
	}
	return true;
};	


export function checkBoundsItem(selectionRect, item, event) {
	var itemBounds = new paper.Path([
		item.localToGlobal(item.internalBounds.topLeft),
		item.localToGlobal(item.internalBounds.topRight),
		item.localToGlobal(item.internalBounds.bottomRight),
		item.localToGlobal(item.internalBounds.bottomLeft)
	]);
	itemBounds.closed = true;
	itemBounds["guide"] = true;

	for(var i=0; i<itemBounds.segments.length; i++) {
		var seg = itemBounds.segments[i];
		if( selectionRect.contains(seg.point) ||
			(i === 0 && selectionRect.getIntersections(itemBounds).length > 0)) {
			if(event.modifiers.shift && item.selected) {
				setItemSelection(item,false);

			} else {
				setItemSelection(item,true);
			}
			itemBounds.remove();
			return true;
			
		}
	}

	itemBounds.remove();
};


