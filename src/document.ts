import saveAs from "file-saver";
import paper from "paper";

import pgExport from "../js/export";
import guides from "../js/guides";
import hover from "../js/hover";
import editTH2 from "./editTH2";
import * as layer from "./layer";
import * as selection from "./selection";
import * as toolbar from "./toolbar";
import * as undo from "./undo";

let center: paper.Point;
let clipboard = [];

export function setup() {
	paper.view.center = new paper.Point(0,0);
	center = paper.view.center;
	
	// call DocumentUpdate at a reduced rate (every tenth frame)
	// var int = 10;
	// paper.view.onFrame = function() {
	// 	if(int > 0) {
	// 		int--;
	// 	} else {
	// 		jQuery(document).trigger('DocumentUpdate');
	// 		int = 10;
	// 	}
	// };
	
	
	window.onbeforeunload = function() {
		if(undo.getStates().length > 1) {
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


export function loadJSONDocument(jsonString) {
	const activeLayerID = paper.project.activeLayer.data.id;
	paper.project.clear();
	toolbar.setDefaultTool();
	pgExport.setExportRect();

	paper.project.importJSON(jsonString);
	
	layer.reinitLayers(activeLayerID);

	const exportRect = guides.getExportRectGuide();
	if(exportRect) {
		pgExport.setExportRect(new paper.Rectangle(exportRect.data.exportRectBounds));
	}
	editTH2.redrawAll();
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