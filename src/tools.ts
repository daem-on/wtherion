// functions related to tools

import select from "../js/tools/select";
import detailselect from "../js/tools/detailselect.js";
import draw from "../js/tools/draw";
import bezier from "../js/tools/bezier";
import * as point from "./tools/point";
// import text from "../js/tools/text.paper.js";
// import rotate from "../js/tools/rotate.paper.js";
// import scale from "../js/tools/scale.paper.js";
// import zoom from "../js/tools/zoom.paper.js";
import viewgrab from "../js/tools/viewgrab.js";
import viewzoom from "../js/tools/viewzoom.js";
import * as inspect from "./tools/inspect";

import toolOptions from "../js/toolOptions";

export let tools = {
	select: select,
	detailselect: detailselect,
	draw: draw,
	bezier: bezier,
	point: point,
	// text: text,
	// rotate: rotate,
	// scale: scale,
	// zoom: zoom,
	viewgrab: viewgrab,
	viewzoom: viewzoom,
	inspect: inspect,
}

let toolList = toolOptions;
export function getToolList() {
	return toolList;
}


export function getToolInfoByID(id: string) {
	for(var i=0; i<toolList.length; i++) {
		if(toolList[i].id == id) {
			return toolList[i];
		}
	}
}


// localstorage
export function getLocalOptions(options: { [x: string]: any; id: string; }) {
	var storageJSON = localStorage.getItem('pg.tools.'+options.id);
	if(storageJSON && storageJSON.length > 0) {
		var storageOptions = JSON.parse(storageJSON);
		
		// only overwrite options that are stored
		// new options will use their default value
		for(var option in options) {
			if(storageOptions.hasOwnProperty(option)) {
				options[option] = storageOptions[option];
			}
		}
	}
	return options;
}


export function setLocalOptions(options: { id: string; }) {
	var optionsJSON = JSON.stringify(options, null, 2);
	localStorage.setItem('pg.tools.'+options.id, optionsJSON);
}


export function deleteLocalOptions(id: string) {
	localStorage.removeItem('pg.tools.'+id);
}