import { getSelectedItems } from "./selection";
import { snapshot } from "./undo";

export function bringSelectionToFront() {
	snapshot('bringSelectionToFront');
	const items = getSelectedItems();
	for(let i=0; i < items.length; i++) {
		items[i].bringToFront();
	}
}

export function sendSelectionToBack() {
	snapshot('sendSelectionToBack');
	const items = getSelectedItems();
	for(let i=0; i < items.length; i++) {
		items[i].sendToBack();
	}
}
	