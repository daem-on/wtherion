import saveAs from "file-saver";
import paper from "paper";

import * as pgExport from "./export";
import * as guides from "./guides";
import * as hover from "./hover";
import * as layer from "./layer";
import * as selection from "./selection";
import * as tools from "./tools";
import * as undo from "./undo";
import { redrawAll } from "./objectDefs";
import editTH2 from "./editTH2";
import { reactiveMap } from "./objectSettings/reactiveMap";

let center: paper.Point;
let clipboard = [];

export function setup() {
	paper.view.center = new paper.Point(0,0);
	center = paper.view.center;	
	
	window.onbeforeunload = function() {
		if (undo.getStates().length > 1) {
			return 'Unsaved changes will be lost. Leave anyway?';
		}
	};
}


export function clear() {
	paper.project.clear();
	undo.clear();
	setup();
	layer.setup();
}


export function getCenter() {
	return center;
}


export function getClipboard() {
	return clipboard;	
}


export function pushClipboard(item) {
	clipboard.push(item);
	return true;
}


export function clearClipboard() {
	clipboard = [];
	return true;
}


export function getAllSelectableItems() {
	return paper.project.getItems({
		recursive: true,
		match: (item: paper.Item) => item.data
			&& !item.data.isHelperItem
			&& item.layer === paper.project.activeLayer
	});
}

export function deserializeJSON(jsonString: string): any {
	return JSON.parse(jsonString, (key, value) => {
		if (key === "therionData") {
			return reactiveMap(value);
		}
		return value;
	});
}

export function loadJSONDocument(jsonString: string) {
	const activeLayerID = paper.project.activeLayer.data.id;
	paper.project.clear();
	tools.setDefaultTool();
	pgExport.setExportRect();

	paper.project.importJSON(deserializeJSON(jsonString));

	layer.reinitLayers(activeLayerID);

	redrawAll();
	undo.clear();
	undo.snapshot('loadJSONDocument');
}


export function saveJSONDocument() {
	const fileName = prompt("Name your file", "export.json");

	if (fileName != null) {
		const json = documentAsJSON();
		const fileNameNoExtension = fileName.split(".json")[0];
		const blob = new Blob([json], { type: "text/json" });
		saveAs(blob, fileNameNoExtension+'.json');
	}
}

export function documentAsJSON() {
	hover.clearHoveredItem();
	selection.clearSelection();
	paper.view.update();

	return paper.project.exportJSON({ asString: true });
}