import { componentList } from "../../js/toolOptionPanel";
import pg from "../init";
import symbolList from "../../js/res/symbol-list.json";
import getSettings from "../objectSettings/model/getSettings";
import PointSettings from "../objectSettings/model/PointSettings";

const types = [];
for (const category in symbolList)
	types.push(symbolList[category]);

export let options = {
	id: "point",
	type: "station",
	stationName: "",
};

const components: componentList<Partial<typeof options>> = {
	type: {
		type: "list",
		label: "Type",
		options: types
	},
	stationName: {
		type: "text",
		label: "Station reference",
		requirements: {
			type: "station"
		}
	},
}

export function activateTool() {
	const tool = new paper.Tool();

	// get options from local storage if present
	options = pg.tools.getLocalOptions(options) as any;

	tool.onMouseDown = function(event: any) {
		if (event.event.button > 0) return;

		const point = pg.editTH2.createPoint(event.point);
		const settings = getSettings(point) as PointSettings;
		settings.type = options.type;
		if (options.type === "station") {
			settings.name = options.stationName;
			increaseStationNumber();
		}
		pg.editTH2.drawPoint(point);
	}

	pg.toolOptionPanel.setup(options, components, function() {
		pg.tools.setLocalOptions(options);
	});

	tool.activate();
}

function increaseStationNumber() {
	if (options.stationName.includes("@")) {
		const split = options.stationName.split("@")
		options.stationName = (Number.parseInt(split[0])+1) + "@" + split[1];
		pg.tools.setLocalOptions(options)
		pg.toolOptionPanel.update(options);
	}
}