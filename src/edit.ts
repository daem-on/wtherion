import paper from "paper";
import { getActiveLayer } from "./layer";
import { clearSelection, getSelectedItems } from "./selection";
import { snapshot } from "./undo";
import * as wtConf from "./filesio/configManagement";

const MIME = "web application/json+wtherion";

let localClipboard = [];

export function copySelectionToClipboard() {
	const selectedItems = getSelectedItems();
	const values = selectedItems
		.map(item => item.exportJSON());

	if (wtConf.get("enableAsyncClipboard")) {
		const clipboardItems = values.map(json => {
			const blob = new Blob([json], { type: MIME });
			return new ClipboardItem({ [MIME]: blob });
		});
		navigator.clipboard.write(clipboardItems);
	} else {
		localClipboard = values;
	}
}

export async function pasteObjectsFromClipboard() {
	snapshot('pasteObjectsFromClipboard');
	clearSelection();
	
	const items: string[] = [];
	if (wtConf.get("enableAsyncClipboard")) {
		const clipboard = await navigator.clipboard.read();
		for (const item of clipboard) {
			if (!item.types.includes(MIME)) continue;
			const blob = await item.getType(MIME);
			items.push(await blob.text());
		}
	} else {
		items.push(...localClipboard);
	}
	for (const item of items) {
		const created = paper.project.importJSON(item);
		if (!created) continue;
		created.selected = true;
		const placedItem = getActiveLayer().addChild(created);
		placedItem.position.x += 20;
		placedItem.position.y += 20;
		paper.project.view.update();
	}
}