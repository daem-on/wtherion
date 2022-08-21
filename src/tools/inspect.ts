import pg from "../init";
import getSettings from "../objectSettings/model/getSettings";
import paper from "paper";

let tool: paper.Tool;

export const options = {};

const menuEntries = {};

export function objectToString(object: any) {
	const s = getSettings(object);
	if (!s) return "%inspect.unrecognized%";

	switch (s.className) {
		case "LineSettings":
			const subtype = s.subtype ? ":"+s.subtype : "";
			return `%inspect.line% ${s.type + subtype} ${s.invisible ? "invisible" : ""}`;
		case "AreaSettings":
			return `%inspect.area% ${s.type} %inspect.withLine% ${s.lineSettings.type}`;
		case "PointSettings":
			if (s.type === "station") return `%inspect.point% ${s.type} ${s.name}`;
			else return `%inspect.point% ${s.type}`;
	}
}

export function activateTool() {	
	pg.selection.clearSelection();	
	tool = new paper.Tool();
			
	const hitOptions = {
		segments: true,
		stroke: true,
		curves: true,
		handles: true,
		fill: true,
		guide: false,
		tolerance: 3
	};
	
	let hitType;
	
	tool.onMouseDown = function(event) {
	};
	
	tool.onMouseMove = function(event: paper.ToolEvent) {
		// pg.hover.handleHoveredItem(hitOptions, event);
		// const hovered = pg.hover.getHoveredItem();

		const hovered = paper.project.hitTest(event.point, hitOptions);

		if (hovered) {
			pg.statusbar.showCustom(objectToString(hovered.item));
		} else {
			const x = event.point.x.toFixed(1);
			const y = event.point.y.toFixed(1);
			pg.statusbar.showCustom(`%inspect.position%: ${x}, ${y}`);
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
}


export function deactivateTool() {
	pg.hover.clearHoveredItem();
	pg.menu.clearToolEntries();
}
