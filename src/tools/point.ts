import { getLocalOptions, setLocalOptions } from "../../src/tools";
import editTH2 from "../editTH2";
import toolOptionPanel, { componentList } from "../toolOptionPanel";
import * as undo from "../undo";
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
	options = getLocalOptions(options) as any;

	tool.onMouseDown = function(event: correctToolEvent) {
		if (event.event.button > 0) return;

		const result = paper.project.hitTest(event.point, {
			fill: true
		});

		const point = editTH2.createPoint(event.point);
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
		editTH2.drawPoint(point);
		undo.snapshot("point");
	};

	toolOptionPanel.setupFloating(options, components, function() {
		setLocalOptions(options);
	}); 

	tool.activate();
}

function increment(original: string): string {
	const number = Number.parseInt(original);
	if (isNaN(number)) return original;
	else return (number + 1).toString();
}

function increaseStationNumber() {
	if (options.stationName.includes("@")) {
		const split = options.stationName.split("@");
		options.stationName = increment(split[0]) + "@" + split[1];
	} else {
		options.stationName = increment(options.stationName);
	}
	setLocalOptions(options);
	toolOptionPanel.update(options);
}