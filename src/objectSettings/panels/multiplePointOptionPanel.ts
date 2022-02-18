import { componentList } from "../../../js/toolOptionPanel";
import getSettings from "../model/getSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
import pg from "../../init";
import PointSettings from "../model/PointSettings";
import symbolList from "../../../js/res/symbol-list.json";

const types = [""];
for (const category in symbolList)
	types.push(symbolList[category]);

const defaultOptions = () => ({
	type: ""
});

let optionsCache = defaultOptions();
let pointArray: paper.Shape[];
let pointSettingsArray: PointSettings[];
	
const components: componentList = {
	type: {
		type: "list",
		label: "Type",
		options: types,
	},
	execute: {
		type: "button",
		click: modifyObject,
		label: "Apply",
	}
}

function modifyObject() {
	for (const option in optionsCache) {
		if (optionsCache[option] !== "") {
			for (const point of pointSettingsArray)
				point[option] = optionsCache[option];
		}
	}
	for (const point of pointArray) pg.editTH2.drawPoint(point);
}

export default function(points: paper.Shape[]): objectOptionPanelConfig {
	pointArray = points;
	pointSettingsArray = [];
	optionsCache = defaultOptions();
	for (const point of points)
		pointSettingsArray.push(getSettings(point));

	return {
		options: optionsCache,
		components: components,
		callback: () => {},
	}
}