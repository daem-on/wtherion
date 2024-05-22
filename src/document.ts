import saveAs from "file-saver";
import paper from "paper";

import versionConfig from "../versionconfig.json";
import * as pgExport from "./export";
import * as hover from "./hover";
import { i18n } from "./i18n";
import * as layer from "./layer";
import { redrawAll } from "./objectDefs";
import { reactiveMap } from "./objectSettings/reactiveMap";
import * as selection from "./selection";
import * as tools from "./tools";
import * as undo from "./undo";

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
		if (key === "therionData" || key === "lineSettings") { // TODO: rename lineSettings
			return reactiveMap(value);
		}
		return value;
	});
}

function promptVersionMismatch(version: string): boolean {
	return confirm(i18n.global.t(`save.versionMismatch`, {
		version: version ?? i18n.global.t("save.unknownVersion"),
	}));
}

export function loadJSONDocument(jsonString: string): boolean {
	const activeLayerID = paper.project.activeLayer.data.id;

	const value = deserializeJSON(jsonString);

	const version = value?.meta?.version;
	if (version !== versionConfig.saveFileVersion)
		if (!promptVersionMismatch(version)) return false;

	paper.project.clear();
	tools.setDefaultTool();
	pgExport.setExportRect();

	paper.project.importJSON(value?.content);

	layer.reinitLayers(activeLayerID);

	redrawAll();
	undo.clear();
	undo.snapshot('loadJSONDocument');
	return true;
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

export function documentAsJSON(): string {
	hover.clearHoveredItem();
	selection.clearSelection();
	paper.view.update();

	const content = paper.project.exportJSON({ asString: false }) as any;
	return JSON.stringify({
		meta: { version: versionConfig.saveFileVersion },
		content,
	});
}
