import { componentList } from "../toolOptionPanel";
import pg from "../init";
import getSettings from "../objectSettings/model/getSettings";
import PointSettings from "../objectSettings/model/PointSettings";
import paper from "paper";
import { correctToolEvent } from "./select";
import { pointTypes } from "../objectSettings/pointSymbolList";

export let options = {
	id: "point",
	type: "station",
	stationName: "",
};

const components: componentList<Partial<typeof options>> = {
	type: {
		type: "list",
		label: "%type%",
		options: pointTypes
	},
	stationName: {
		type: "text",
		label: "%stationName%",
		requirements: {
			type: "station"
		}
	},
};

export function activateTool() {
	const tool = new paper.Tool();

	// get options from local storage if present
	options = pg.tools.getLocalOptions(options) as any;

	tool.onMouseDown = function(event: correctToolEvent) {
		if (event.event.button > 0) return;

		const result = paper.project.hitTest(event.point, {
			fill: true
		});

		const point = pg.editTH2.createPoint(event.point);
		const settings = getSettings(point) as PointSettings;

		if (result?.item.data?.therionData?.className === "XVIStation") {
			point.position = result.item.position;
			settings.type = "station";
			settings.name = result.item.data.therionData.name;
		} else {
			settings.type = options.type;
			if (options.type === "station") {
				settings.name = options.stationName;
				increaseStationNumber();
			}
		}
		pg.editTH2.drawPoint(point);
	};

	pg.toolOptionPanel.setupFloating(options, components, function() {
		pg.tools.setLocalOptions(options);
	}); 

	tool.activate();
}

function increaseStationNumber() {
	if (options.stationName.includes("@")) {
		const split = options.stationName.split("@");
		options.stationName = (Number.parseInt(split[0])+1) + "@" + split[1];
		pg.tools.setLocalOptions(options);
		pg.toolOptionPanel.update(options);
	}
}