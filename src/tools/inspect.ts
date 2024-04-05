import getSettings from "../objectSettings/model/getSettings";
import paper from "paper";
import * as selection from "../selection";
import * as sb from "../statusbar";
import * as menu from "../menu";
import * as hover from "../hover";
import * as config from "../filesio/configManagement";
import { defineTool } from "src/tools";

function objectToString(object: any) {
	if (object?.data?.therionData?.className === "XVIStation") {
		return `XVI: ${object.data.therionData.name}`;
	}

	const s = getSettings(object);
	if (!s) return null;

	let text = "";

	switch (s.className) {
		case "LineSettings":
			const subtype = s.subtype ? ":"+s.subtype : "";
			text += "%inspect.line%";
			text += ` ${s.type + subtype}`;
			text += s.invisible ? " invisible" : "";
			break;
		case "AreaSettings":
			text += `%inspect.area% ${s.type}`;
			text += ` %inspect.withLine% ${s.lineSettings.type}`;
			break;
		case "PointSettings":
			text += "%inspect.point%";
			text += " ";
			if (s.type === "station") text += `${s.type} ${s.name}`;
			else text += `${s.type}`;
	}

	return text;
}

export const inspect = defineTool({
	definition: {
		id: 'inspect',
		name: '%tools.inspect%',
		options: {},
	},
	setup(on) {
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

		on("activate", () => {
			selection.clearSelection();
		});
		
		on("mousemove", (event: paper.ToolEvent) => {	
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
		});

		on("deactivate", () => {
			hover.clearHoveredItem();
			menu.clearToolEntries();
			sb.showCustom("");
		});
	},
});
