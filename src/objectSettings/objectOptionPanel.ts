import { componentList } from "../../js/toolOptionPanel";
import pg from "../init";
import getSettings from "./model/getSettings";
import lineOptionPanel from "./panels/lineOptionPanel";
import segmentOptionPanel from "./panels/segmentOptionPanel";
import areaOptionPanel from "./panels/areaOptionPanel";

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
		let therionType = getSettings(selected[0]).className
		if (therionType == "LineSettings")
			config = lineOptionPanel(selected[0] as paper.Path);
		else if (therionType == "AreaSettings") {
			config = areaOptionPanel(selected[0] as paper.Path);
		}
	} else {
		return;
	}

	if (!config) return;
	pg.toolOptionPanel.setup(
		config.options,
		config.components,
		config.callback
	);
}