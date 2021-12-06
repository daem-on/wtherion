import { componentList } from "../../js/toolOptionPanel";
import pg from "../init";
import lineOptionPanel from "./panels/lineOptionPanel";

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
	if (selected[0].className === "Path") {
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