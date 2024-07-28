// functions related to selecting stuff
import paper from "paper";
import * as compoundPath from "./compoundPath";
import * as geometry from "./geometry";
import * as math from "./math";
import * as pgDocument from "./document";
import * as groups from "./group";
import * as items from "./item";
import { setActiveLayer } from "./layer";
import * as undo from "./undo";
import { triggers } from "./triggers";

export function selectAllItems() {
	const items = pgDocument.getAllSelectableItems();
	for (const item of items) setItemSelection(item, true);
}


export function selectRandomItems() {
	const items = pgDocument.getAllSelectableItems();
	
	for (const item of items) {
		if (math.getRandomBoolean()) {
			setItemSelection(item, true);
		}
	}
}

export function focusItem(item: paper.Item): void {
	paper.project.deselectAll();
	if (item.layer !== paper.project.activeLayer) {
		setActiveLayer(item.layer);
	}
	item.selected = true;
	paper.view.center = item.bounds.center;
	triggers.emit("SelectionChanged");
}

export function selectAllSegments() {
	const items = pgDocument.getAllSelectableItems();
	for (const item of items) selectItemSegments(item, true);
}


export function selectItemSegments(item: paper.Item, state: boolean) {
	if (item.children) {
		for (const child of item.children) {
			if (!items.isPathItem(child)) continue;
			if (child.children && child.children.length > 0) {
				selectItemSegments(child, state);
			} else {
				child.fullySelected = state;
			}
		}
	} else {
		if (!items.isPathItem(item)) return;
		for (const segment of item.segments) segment.selected = state;
	}
}


export function clearSelection() {
	paper.project.deselectAll();
	
	triggers.emit("SelectionChanged");
}


export function invertItemSelection() {
	const items = pgDocument.getAllSelectableItems();
	for (const item of items) item.selected = !item.selected;	
	triggers.emit("SelectionChanged");
}


export function invertSegmentSelection() {
	const list = pgDocument.getAllSelectableItems();

	for (const item of list) {
		if (!items.isPathItem(item) || !item.segments) continue;
		for (const segment of item.segments) segment.selected = !segment.selected;
	}
}


export function deleteItemSelection() {
	for (const item of getSelectedItems()) item.remove();
	
	triggers.emitAll(["DeleteItems", "SelectionChanged"]);
	paper.project.view.update();
	undo.snapshot('deleteItemSelection');
}


export function splitPathAtSelectedSegments() {
	const items = getSelectedItems() as paper.Path[];
	for (const item of items) {
		for (const segment of [...item.segments]) {
			if (segment.selected) {
				if (item.closed ||
					(segment.next && 
					!segment.next.selected &&
					segment.previous &&
					!segment.previous.selected)) {
					splitPathRetainSelection(segment, false);
				}
			}
		}
	}
}

/**
	* This function is borrowed straight from an older version
	* of Paper.js, for some reason they just removed it.
	* But we need it for splitting by segment index, so here it is.
	*/
function split(path: paper.Path, index: number, time: number) {
	let curve: paper.Curve;
	const location = time === undefined ? index
			: (curve = path.curves[index])
				&& curve.getLocationAtTime(time);
	return location != null ? path.splitAt(location) : null;
}

function copyData(source: paper.Item, target: paper.Item) {
	if (source.data) {
		target.data = pgDocument.deserializeJSON(JSON.stringify(source.data));
	}
}

export function splitPathRetainSelection(segment: paper.Segment, deselectSplitSegments?: boolean): void {
	const { path, index } = segment;
	const selectedSegments = path.segments.filter(seg => seg.selected && !(deselectSplitSegments && seg.index === index));
	const newPath = split(path, index, 0);
	if (!newPath) return;
	copyData(path, newPath);
	
	for (const seg of selectedSegments) seg.selected = true;
}


export function cloneSelection() {
	const selectedItems = getSelectedItems();
	for (const item of selectedItems) {
		const cloned = item.clone();
		copyData(item, cloned);
		item.selected = false;
	}

	undo.snapshot('cloneSelection');
}


export function setItemSelection(item: paper.Item, state: boolean) {
	if (item.layer !== paper.project.activeLayer) return;
	
	// if selection is in a group, select group not individual items
	if (item.parent && (groups.isGroup(item.parent) || items.isCompoundPathItem(item.parent))) {
		// do it recursive
		setItemSelection(item.parent, state);
	} else {
		if (item.data && item.data.noSelect) return;
		// fully selected segments need to be unselected first
		if (items.isPathItem(item)) item.fullySelected = false;
		// then the item can be normally selected
		item.selected = state;
		// deselect children of compound-path or group for cleaner item selection
		if (compoundPath.isCompoundPath(item) || groups.isGroup(item)) {
			for (const child of item.children) child.selected = false;
		}
	}
	
	triggers.emit("SelectionChanged");
}

/**
	* this gets all selected non-grouped items and groups
	* (alternative to paper.project.selectedItems, which includes 
	* group children in addition to the group)
	*/
export function getSelectedItems() {
	const allItems = paper.project.selectedItems;
	const itemsAndGroups: paper.Item[] = allItems.filter(item => {
		if (items.isLayer(item)) return false;
		if (!groups.isGroup(item.parent)) {
			if (!item.data || !item.data.isSelectionBound) {
				return true;
			}
		}
		return false;
	});
	// sort items by index (0 at bottom)
	itemsAndGroups.sort((a, b) => {
		return a.index - b.index;
	});
	return itemsAndGroups;
}

export function getSelectionType(): string | undefined {
	const selection = getSelectedItems();
	if (selection.length === 0) return;
	const first = selection[0];
	if (items.isPathItem(first) && first.segments.some(seg => seg.selected)) {
		return "Segment";
	}
	return selection.some(item => item.className !== first.className) ? "Mixed" : first.className;
}


// only returns paths, no compound paths, groups or any other stuff
export function getSelectedPaths(): paper.Path[] {
	return getSelectedItems().filter(items.isPathItem);
}

export function smoothHandles() {
	switchSelectedHandles("smooth");
}

export function switchSelectedHandles(mode?: "linear" | "smooth") {
	for (const item of getSelectedItems()) {
		if (!items.isPathItem(item)) continue;
		for (const segment of item.segments) {
			if (segment.selected) geometry.switchHandle(segment, mode);
		}
	}
	undo.snapshot('switchSelectedHandles');
}


export function removeSelectedSegments() {
	for (const item of getSelectedItems()) {
		if (!items.isPathItem(item)) continue;
		for (const segment of [...item.segments]) {
			if (segment.selected) segment.remove();
		}
	}
	undo.snapshot('removeSelectedSegments');
}


export function processRectangularSelection(invert: boolean, rect: paper.PathItem, mode?: "detail") {	
	for (const item of pgDocument.getAllSelectableItems()) {
		// check for item segment points inside selectionRect
		if (groups.isGroup(item) || items.isCompoundPathItem(item)) {
			if (!handleRectangularSelectionGroup(item, rect, invert, mode)) {
				continue;
			}
		} else {
			if (!handleRectangularSelectionItem(item, invert, rect, mode)) {
				continue;
			}
		}
	}
}


// if the rectangular selection found a group, drill into it recursively
function handleRectangularSelectionGroup(group: paper.Group | paper.CompoundPath, rect: paper.PathItem, invert: boolean, mode?: "detail") {
	for (const child of group.children) {
		if (groups.isGroup(child) || items.isCompoundPathItem(child)) {
			handleRectangularSelectionGroup(child, rect, invert, mode);
		} else {
			if (!handleRectangularSelectionItem(child, invert, rect, mode)) {
				return false;
			}
		}
	}
	return true;
}


function handleRectangularSelectionItem(item: paper.Item, invert: boolean, rect: paper.PathItem, mode?: "detail") {
	if (item.layer !== paper.project.activeLayer) return;
	if (items.isPathItem(item)) {
		let segmentMode = false;
		
		// first round checks for segments inside the selectionRect
		for (const seg of item.segments) {
			if (rect.contains(seg.point)) {
				if (mode === 'detail') {
					if (invert && seg.selected) {
						seg.selected = false;
					} else {
						seg.selected = true;
					}
					segmentMode = true;
				} else {
					setItemSelection(item, !invert || !item.selected);
					return false;
				}
			}
		}

		// second round checks for path intersections
		const intersections = item.getIntersections(rect);
		if (intersections.length > 0 && !segmentMode) {
			// if in detail select mode, select the curves that intersect
			// with the selectionRect
			if (mode === 'detail') {
				// intersections contains every curve twice because
				// the selectionRect intersects a circle always at
				// two points. so we skip every other curve
				for (const { curve } of intersections.filter((_, i) => i % 2 === 0)) {
					if (invert) {
						curve.selected = !curve.selected;
					} else {
						curve.selected = true;
					}
				}

			} else {
				setItemSelection(item, !invert || !item.selected);
				return false;
			}
		}
	} else if (items.isBoundsItem(item)) {
		if (handleRectangularSelectionBoundsItem(rect, item, invert)) {
			return false;
		}
	}
	return true;
}	

function createItemBoundsPath(item: paper.Item): paper.Path {
	const b = item.internalBounds;
	return new paper.Path(
		[b.topLeft, b.topRight, b.bottomRight, b.bottomLeft]
		.map(point => item.localToGlobal(point))
	);
}

function handleRectangularSelectionBoundsItem(selectionRect: paper.PathItem, item: paper.Item, invert: boolean) {
	const itemBounds = createItemBoundsPath(item);
	itemBounds.closed = true;
	itemBounds["guide"] = true;

	const isIntersecting = selectionRect.intersects(itemBounds);
	if (isIntersecting || itemBounds.segments.some(seg => selectionRect.contains(seg.point))) {
		setItemSelection(item, !invert || !item.selected);
		itemBounds.remove();
		return true;
	}
	itemBounds.remove();
}

triggers.onAny(["LayerAdded", "LayersChanged"], () => clearSelection());
