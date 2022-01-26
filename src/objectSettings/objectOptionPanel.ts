import { componentList } from "../../js/toolOptionPanel";
import pg from "../init";
import getSettings from "./model/getSettings";
import lineOptionPanel from "./panels/lineOptionPanel";
import segmentOptionPanel from "./panels/segmentOptionPanel";
import areaOptionPanel from "./panels/areaOptionPanel";
import pointOptionPanel from "./panels/pointOptionPanel";
import multipleLineOptionPanel from "./panels/multipleLineOptionPanel";

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
	
	let config: objectOptionPanelConfig;

	if (selected.length == 0) return;

	// Multiple selection
	else if (selected.length > 1) {
		let className: string = selected[0].className;
		for (let item of selected) {
			if (item.className !== className) return;
		}
		if (pg.toolbar.getActiveTool().options.id == "select"
			&& selected[0].className === "Path"
			&& getSettings(selected[0]).className == "LineSettings") {
			config = multipleLineOptionPanel(selected as paper.Path[]);
		} else return;

	// Single selection
	} else {

		// Detail select
		if (pg.toolbar.getActiveTool().options.id == "detailselect") {
			// only supporting wall for subtypes editor (currently)
			if (selected[0].data.therionData.type !== "wall") return;
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
		
		// Non-detail select
		else if (selected[0].className === "Path") {
			let settings = getSettings(selected[0])
			if (settings.className == "LineSettings")
				config = lineOptionPanel(selected[0] as paper.Path);
			else if (settings.className == "AreaSettings") 
				config = areaOptionPanel(selected[0] as paper.Path);
		} else if (selected[0].className === "Shape") {
			if (getSettings(selected[0]).className == "PointSettings") 
				config = pointOptionPanel(selected[0] as paper.Shape);
		} else return;
	}

	if (!config) return;
	pg.toolOptionPanel.setup(
		config.options,
		config.components,
		config.callback
	);
}