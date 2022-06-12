import { componentList } from "../toolOptionPanel";
import pg from "../init";
import getSettings, { PaperItemType } from "./model/getSettings";
import lineOptionPanel from "./panels/lineOptionPanel";
import subtypeOptionPanel from "./panels/subtypeOptionPanel";
import segmentOptionPanel from "./panels/defaultSegmentOptionPanel";
import areaOptionPanel from "./panels/areaOptionPanel";
import pointOptionPanel from "./panels/pointOptionPanel";
import multipleLineOptionPanel from "./panels/multipleLineOptionPanel";
import multiplePointOptionPanel from "./panels/multiplePointOptionPanel";
import * as wtConfig from "../configManagement";

export type objectOptionPanelConfig = {
	options: Record<string, any>,
	components: componentList<any>,
	callback: () => void
}

function removeWindow() {
	jQuery('.toolOptionPanel').remove();
}

export function updateWindow() {
	const selected = pg.selection.getSelectedItems() as PaperItemType[];
	
	removeWindow();
	
	let config: objectOptionPanelConfig;

	if (selected.length == 0) return;

	// Multiple selection
	else if (selected.length > 1) {
		const className: string = selected[0].className;
		for (const item of selected) {
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
			if (selected.length > 1 ||selected[0].className != "Path")
				return;
			// ensure only one segment is editable
			let selection = false;
			for (const segment of (selected[0] as paper.Path).segments) {
				if (segment.selected) {
					if (selection) return;
					else selection = true;
				}
			}
			// only supporting wall for subtypes editor (currently)
			if (selected[0].data.therionData.type === "wall")
				config = subtypeOptionPanel(selected[0] as paper.Path);
			else if (wtConfig.get("showSegmentOptionPanel"))
				config = segmentOptionPanel(selected[0] as paper.Path);
		}
		
		// Non-detail select
		else if (isPath(selected[0])) {
			const settings = getSettings(selected[0]);
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
	pg.toolOptionPanel.setupFloating(
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

