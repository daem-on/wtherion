import { defineTool, getLocalOptions, setLocalOptions } from "../tools";
import editTH2 from "../editTH2";
import toolOptionPanel, { componentList } from "../toolOptionPanel";
import * as undo from "../undo";
import getSettings from "../objectSettings/model/getSettings";
import PointSettings from "../objectSettings/model/PointSettings";
import paper from "paper";
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

export const point = defineTool({
	definition: {
		id: "point",
		name: "tools.point",
		options: options,
	},
	setup(on) {
		on("mousedown", event => {
			if (event.event.button > 0) return;
		
			const point = editTH2.createPoint(event.point);
			const settings = getSettings(point) as PointSettings;

			const xviPoint = paper.project.hitTest(event.point, {
				fill: true,
				match: (item: paper.HitResult) =>
					item.item?.data?.therionData?.className === "XVIStation",
			});

			if (xviPoint) {
				point.position = xviPoint.item.position;
				settings.type = "station";
				settings.name = xviPoint.item.data.therionData.name;
			} else {
				settings.type = options.type;
				if (options.type === "station") {
					settings.name = options.stationName;
					increaseStationNumber();
				}
			}
			editTH2.drawPoint(point);
			undo.snapshot("point");
		});
		
		on("activate", () => {
			options = getLocalOptions(options) as any;
			toolOptionPanel.setupFloating(options, components, function() {
				setLocalOptions(options);
			});
		});
	},
});

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