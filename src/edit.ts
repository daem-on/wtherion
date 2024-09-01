import paper from "paper";
import { getActiveLayer } from "./layer";
import { clearSelection, getSelectedItems } from "./selection";
import { snapshot } from "./undo";
import * as wtConf from "./filesio/configManagement";
import { deserializeJSON } from "./document";
import { useAsyncClipboard, useLocalClipboard } from "grapht/clipboard";

const MIME = "web application/json+wtherion";

const provider = wtConf.get("enableAsyncClipboard")
	? useAsyncClipboard(MIME)
	: useLocalClipboard();

export function copySelectionToClipboard() {
	const selectedItems = getSelectedItems();
	const values = selectedItems
		.map(item => item.exportJSON());
	provider.copy(values);
}

export async function pasteObjectsFromClipboard() {
	snapshot('pasteObjectsFromClipboard');
	clearSelection();
	
	const items = await provider.paste();
	for (const item of items) {
		const created = paper.project.importJSON(deserializeJSON(item));
		if (!created) continue;
		created.selected = true;
		const placedItem = getActiveLayer().addChild(created);
		placedItem.position.x += 20;
		placedItem.position.y += 20;
		paper.project.view.update();
	}
}