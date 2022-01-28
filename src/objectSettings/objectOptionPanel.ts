import { componentList } from "../../js/toolOptionPanel";
import pg from "../init";
import getSettings, { PaperItemType } from "./model/getSettings";
import lineOptionPanel from "./panels/lineOptionPanel";
import segmentOptionPanel from "./panels/segmentOptionPanel";
import areaOptionPanel from "./panels/areaOptionPanel";
import pointOptionPanel from "./panels/pointOptionPanel";
import multipleLineOptionPanel from "./panels/multipleLineOptionPanel";
import multiplePointOptionPanel from "./panels/multiplePointOptionPanel";

export type objectOptionPanelConfig = {
	options: {},
	components: componentList,
	callback: () => void
}

function removeWindow() {
	jQuery('.toolOptionPanel').remove();
}

export function updateWindow() {
	let selected: PaperItemType[] = pg.selection.getSelectedItems();
	
	removeWindow();
	
	let config: objectOptionPanelConfig;

	if (selected.length == 0) return;

	// Multiple selection
	else if (selected.length > 1) {
		let className: string = selected[0].className;
		for (let item of selected) {
			if (item.className !== className) return;
		}
		if (pg.toolbar.getActiveTool().options.id == "select")
		if (isPath(selected[0])
			&& getSettings(selected[0]).className == "LineSettings") {
			config = multipleLineOptionPanel(selected as paper.Path[]);
		} else if (isShape(selected[0])) {
			config = multiplePointOptionPanel(selected as paper.Shape[]);
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
		else if (isPath(selected[0])) {
			let settings = getSettings(selected[0])
			if (settings.className == "LineSettings")
				config = lineOptionPanel(selected[0] as paper.Path);
			else if (settings.className == "AreaSettings")
				config = areaOptionPanel(selected[0] as paper.Path);
		} else if (isShape(selected[0])) {
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

function isPath(selected: PaperItemType): selected is paper.Path {
	return selected.className === "Path";
}

function isShape(selected: PaperItemType): selected is paper.Shape {
	return selected.className === "Shape";
}

