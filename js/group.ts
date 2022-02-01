import pg from "../src/init";

// function related to groups and grouping

export function groupSelection() {
	var items = pg.selection.getSelectedItems();
		if(items.length > 0) {
		var group = new paper.Group(items);
		pg.selection.clearSelection();
		pg.selection.setItemSelection(group, true);
		pg.undo.snapshot('groupSelection');
		jQuery(document).trigger('Grouped');
		return group;
	} else {
		return false;
	}
};


export function ungroupSelection() {
	var items = pg.selection.getSelectedItems();
	ungroupItems(items);
	pg.statusbar.update();
};


export function groupItems(items) {
	if(items.length > 0) {
		var group = new paper.Group(items);
		jQuery(document).trigger('Grouped');
		pg.undo.snapshot('groupItems');
		return group;
	} else {
		return false;
	}
};


// ungroup items (only top hierarchy)
export function ungroupItems(items) {
	var emptyGroups = [];
	for(var i=0; i<items.length; i++) {
		var item = items[i];
		if(isGroup(item) && !item.data.isPGTextItem) {
			ungroupLoop(item, false);

			if(!item.hasChildren()) {
				emptyGroups.push(item);
			}
		}
	}

	// remove all empty groups after ungrouping
	for(var j=0; j<emptyGroups.length; j++) {
		emptyGroups[j].remove();
	}
	jQuery(document).trigger('Ungrouped');
	pg.undo.snapshot('ungroupItems');
};


export function ungroupLoop(group, recursive) {
	// don't ungroup items that are no groups
	if(!group || !group.children || !isGroup(group)) return;
			
	group.applyMatrix = true;
	// iterate over group children recursively
	for(var i=0; i<group.children.length; i++) {
		var groupChild = group.children[i];
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
};


export function getItemsGroup(item) {
	var itemParent = item.parent;

	if(isGroup(itemParent)) {
		return itemParent;
	} else {
		return null;
	}
};


export function isGroup(item: paper.Item): item is paper.Group {
	return pg.item.isGroupItem(item);
};


export function isGroupChild(item: paper.Item) {
	var rootItem = pg.item.getRootItem(item);
	return isGroup(rootItem);
};