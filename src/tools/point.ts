import { defineTool, setLocalOptions } from "../tools";
import editTH2 from "../editTH2";
import toolOptionPanel from "../toolOptionPanel";
import * as undo from "../undo";
import getSettings from "../objectSettings/model/getSettings";
import PointSettings from "../objectSettings/model/PointSettings";
import paper from "paper";
import { markRaw, ref } from "vue";
import PointPanel from "../components/panels/PointPanel.vue";

export const pointOptions = ref({
	id: "point",
	type: "station",
	stationName: "",
});

export const point = defineTool({
	definition: {
		id: "point",
		name: "tools.point",
		panel: markRaw(PointPanel),
	},
	uiState: {
		options: pointOptions.value,
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
				const options = pointOptions.value;
				settings.type = options.type;
				if (options.type === "station") {
					settings.name = options.stationName;
					increaseStationNumber();
				}
			}
			editTH2.drawPoint(point);
			undo.snapshot("point");
		});
	},
});

function increment(original: string): string {
	const number = Number.parseInt(original);
	if (isNaN(number)) return original;
	else return (number + 1).toString();
}

function increaseStationNumber() {
	const options = pointOptions.value;
	if (options.stationName.includes("@")) {
		const split = options.stationName.split("@");
		options.stationName = increment(split[0]) + "@" + split[1];
	} else {
		options.stationName = increment(options.stationName);
	}
	setLocalOptions(options);
	toolOptionPanel.update(options);
}