// functions related to tools

import select from "./tools/select";
import detailselect from "./tools/detailselect";
import draw from "./tools/draw";
import bezier from "./tools/bezier";
import * as point from "./tools/point";
import viewgrab from "./tools/viewgrab";
import viewzoom from "./tools/viewzoom";
import * as inspect from "./tools/inspect";

import toolOptions from "./toolOptions";

export const tools = {
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
};

const toolList = toolOptions;
export function getToolList() {
	return toolList;
}


export function getToolInfoByID(id: string) {
	for(let i=0; i<toolList.length; i++) {
		if(toolList[i].id === id) {
			return toolList[i];
		}
	}
}

type ToolSettings = {
	[key: string]: any,
	id: string
}

// localstorage
export function getLocalOptions<T extends ToolSettings>(options: T): T {
	const storageJSON = localStorage.getItem('pg.tools.'+options.id);
	if(storageJSON && storageJSON.length > 0) {
		const storageOptions = JSON.parse(storageJSON);
		
		// only overwrite options that are stored
		// new options will use their default value
		for(const option in options) {
			if(Object.prototype.hasOwnProperty.call(storageOptions, option)) {
				options[option] = storageOptions[option];
			}
		}
	}
	return options;
}


export function setLocalOptions(options: { id: string; }) {
	const optionsJSON = JSON.stringify(options, null, 2);
	localStorage.setItem('pg.tools.'+options.id, optionsJSON);
}


export function deleteLocalOptions(id: string) {
	localStorage.removeItem('pg.tools.'+id);
}