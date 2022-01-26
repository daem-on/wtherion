import { updateWindow } from "../objectSettings/objectOptionPanel";
import pg from "../init";
import { componentList } from "../../js/toolOptionPanel";
import getSettings from "../objectSettings/model/getSettings";

var tool: paper.Tool;
var keyModifiers = {};

export let options = {};

var menuEntries = {};

function objectToString(object) {
	let s = getSettings(object);
	if (!s) return "Unrecognized";

	switch (s.className) {
		case "LineSettings":
			let subtype = s.subtype ? ":"+s.subtype : ""
			return `Line ${s.type + subtype} ${s.invisible ? "invisible" : ""}`
		case "AreaSettings":
			return `Area ${s.type} with line ${s.lineSettings.type}`
		case "PointSettings":
			if (s.type === "station") return `Point ${s.type} ${s.name}`;
			else return `Point ${s.type}`;
	}
}

export function activateTool() {	
	pg.selection.clearSelection();	
	tool = new paper.Tool();
			
	var hitOptions = {
		segments: true,
		stroke: true,
		curves: true,
		handles: true,
		fill: true,
		guide: false,
		tolerance: 3
	};
	
	var hitType;
	
	tool.onMouseDown = function(event) {
	};
	
	tool.onMouseMove = function(event: paper.ToolEvent) {
		pg.hover.handleHoveredItem(hitOptions, event);
		let hovered = pg.hover.getHoveredItem();
		if (hovered) {
			pg.statusbar.showCustom(objectToString(hovered));
		} else {
			let x = event.point.x.toFixed(1);
			let y = event.point.y.toFixed(1);
			pg.statusbar.showCustom(`Position: ${x}, ${y}`);
		}
	};
	
	tool.onMouseDrag = function(event) {
	};

	tool.onMouseUp = function(event) {
	};
	
	tool.onKeyDown = function(event) {
	};
	
	tool.onKeyUp = function(event) {
	};
	
	// setup floating tool options panel in the editor
	// pg.toolOptionPanel.setup(options, components, function(){ });
	
	pg.menu.setupToolEntries(menuEntries);
	
	tool.activate();
};


export function deactivateTool() {
	pg.hover.clearHoveredItem();
	pg.menu.clearToolEntries();
};
