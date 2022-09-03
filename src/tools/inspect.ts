import getSettings from "../objectSettings/model/getSettings";
import paper from "paper";
import * as selection from "../selection";
import * as sb from "../../js/statusbar";
import * as menu from "../menu";
import * as hover from "../../js/hover";
import * as config from "../filesio/configManagement";

let tool: paper.Tool;

export const options = {};

const menuEntries = {};

export function objectToString(object: any) {
	if (object?.data?.therionData?.className === "XVIStation") {
		return `XVI: ${object.data.therionData.name}`;
	}

	const s = getSettings(object);
	if (!s) return null;

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
	selection.clearSelection();	
	tool = new paper.Tool();

	const tolerance = config.get("inspectTolerance") ?? 8;
			
	const hitOptions = {
		segments: true,
		stroke: true,
		curves: true,
		handles: true,
		fill: true,
		guide: false,
		tolerance: tolerance / paper.view.zoom
	};
	
	let hitType;
	
	tool.onMouseDown = function(event) {
	};
	
	tool.onMouseMove = function(event: paper.ToolEvent) {
		// pg.hover.handleHoveredItem(hitOptions, event);
		// const hovered = pg.hover.getHoveredItem();

		const hovered = paper.project.hitTestAll(event.point, hitOptions);

		if (hovered != null && hovered[0] != null) {
			for (const hit of hovered) {
				const s = objectToString(hit.item);
				if (s) {
					sb.showCustom(s);
					return;
				}
			}
			sb.showCustom("%inspect.unrecognized%");
		} else {
			const x = event.point.x.toFixed(1);
			const y = event.point.y.toFixed(1);
			sb.showCustom(`%inspect.position%: ${x}, ${y}`);
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
	
	menu.setupToolEntries(menuEntries);
	
	tool.activate();
}


export function deactivateTool() {
	hover.clearHoveredItem();
	menu.clearToolEntries();
}
