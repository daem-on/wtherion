import { componentList } from "../../js/toolOptionPanel";
import pg from "../init";
import lineOptionPanel from "./panels/lineOptionPanel";
import segmentOptionPanel from "./panels/segmentOptionPanel";

export type objectOptionPanelConfig = {
	options: {},
	components: componentList,
	callback: () => void
}

function removeWindow() {
	jQuery('.toolOptionPanel').remove();
}

export function updateWindow() {
	let selected: paper.Item[] = pg.selection.getSelectedItems();
	
	removeWindow();
	if (selected.length !== 1) {
		return;
	}

	let config: objectOptionPanelConfig;

	if (pg.toolbar.getActiveTool().options.id == "detailselect") {
		// ensure only one segment is editable
		let selection = false;
		for (let segment of (selected[0] as paper.Path).segments) {
			if (segment.selected) {
				if (selection) return;
				else selection = true;
			}
		}
		config = segmentOptionPanel(selected[0] as paper.Path);
	}

	else if (selected[0].className === "Path") {
		config = lineOptionPanel(selected[0] as paper.Path);
	} else {
		return;
	}

	pg.toolOptionPanel.setup(
		config.options,
		config.components,
		config.callback
	);
}