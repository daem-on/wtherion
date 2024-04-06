import * as selection from "./selection";
import * as undo from "./undo";
import * as statusbar from "./statusbar";
import { getRootItem, isGroupItem } from "./item";
import { triggers } from "./triggers";

// function related to groups and grouping

export function groupSelection() {
	const items = selection.getSelectedItems();
		if(items.length > 0) {
		const group = new paper.Group(items);
		selection.clearSelection();
		selection.setItemSelection(group, true);
		undo.snapshot('groupSelection');
		triggers.emit("Grouped");
		return group;
	} else {
		return false;
	}
}


export function ungroupSelection() {
	const items = selection.getSelectedItems();
	ungroupItems(items);
	statusbar.update();
}


export function groupItems(items) {
	if(items.length > 0) {
		const group = new paper.Group(items);
		triggers.emit("Grouped");
		undo.snapshot('groupItems');
		return group;
	} else {
		return false;
	}
}


// ungroup items (only top hierarchy)
export function ungroupItems(items) {
	const emptyGroups = [];
	for(let i=0; i<items.length; i++) {
		const item = items[i];
		if(isGroup(item) && !item.data.isPGTextItem) {
			ungroupLoop(item, false);

			if(!item.hasChildren()) {
				emptyGroups.push(item);
			}
		}
	}

	// remove all empty groups after ungrouping
	for(let j=0; j<emptyGroups.length; j++) {
		emptyGroups[j].remove();
	}
	triggers.emit("Ungrouped");
	undo.snapshot('ungroupItems');
}


export function ungroupLoop(group, recursive) {
	// don't ungroup items that are no groups
	if(!group || !group.children || !isGroup(group)) return;
			
	group.applyMatrix = true;
	// iterate over group children recursively
	for(let i=0; i<group.children.length; i++) {
		const groupChild = group.children[i];
		if(groupChild.hasChildren()) {

			// recursion (groups can contain groups, ie. from SVG import)
			if(recursive) {
				ungroupLoop(groupChild, true);
			} else {
				groupChild.applyMatrix = true;
				group.layer.addChild(groupChild);
				i--;
			}

		} else {
			groupChild.applyMatrix = true;
			// move items from the group to the activeLayer (ungrouping)
			group.layer.addChild(groupChild);
			i--;
		}
	}
}


export function getItemsGroup(item) {
	const itemParent = item.parent;

	if(isGroup(itemParent)) {
		return itemParent;
	} else {
		return null;
	}
}


export function isGroup(item: paper.Item): item is paper.Group {
	return isGroupItem(item);
}


export function isGroupChild(item: paper.Item) {
	const rootItem = getRootItem(item);
	return isGroup(rootItem);
}