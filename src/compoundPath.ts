import { getSelectedItems, getSelectedPaths, setItemSelection } from "./selection";
import { snapshot } from "./undo";


export function isCompoundPath(item) {
	return item && item.className === 'CompoundPath';
}

export function isCompoundPathChild(item) {
	if(item.parent) {
		return item.parent.className === 'CompoundPath';
	} else {
		return false;
	}
}

export function getItemsCompoundPath(item) {
	const itemParent = item.parent;

	if(isCompoundPath(itemParent)) {
		return itemParent;
	} else {
		return null;
	}
	
}

export function createFromSelection() {
	const items = getSelectedPaths();
	if(items.length < 2) return;
	
	const path = new paper.CompoundPath({fillRule: 'evenodd'});
	
	for(let i=0; i<items.length; i++) {
		path.addChild(items[i]);
		items[i].selected = false;
	}
	
	setItemSelection(path, true);
	snapshot('createCompoundPathFromSelection');
}

export function releaseSelection() {
	const items = getSelectedItems();
	
	const cPathsToDelete = [];
	for(let i=0; i<items.length; i++) {
		const item = items[i];
		
		if(isCompoundPath(item)) {
			
			for(let j=0; j<item.children.length; j++) {
				const path = item.children[j];
				path.parent = item.layer;
				setItemSelection(path, true);
				j--;
			}
			cPathsToDelete.push(item);
			setItemSelection(item, false);
			
		} else {
			items[i].parent = item.layer;
		}
	}
	
	for(let j=0; j<cPathsToDelete.length; j++) {
		cPathsToDelete[j].remove();
	}
	snapshot('releaseCompoundPath');
}
