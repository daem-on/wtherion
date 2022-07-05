import { componentList } from "../../toolOptionPanel";
import getSettings from "../model/getSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
import pg from "../../init";
import PointSettings from "../model/PointSettings";
import { pointTypes } from "../pointSymbolList";

const defaultOptions = () => ({
	type: "",
	scale: "",
	invisible: 0
});

const stringOptions = ["type", "scale"];
const booleanValues = [null, true, false];
let optionsCache = defaultOptions();
let pointArray: paper.Shape[];
let pointSettingsArray: PointSettings[];
	
const components: componentList<any> = {
	type: {
		type: "list",
		label: "%type%",
		options: pointTypes,
	},
	scale: {
		type: "list",
		label: "%scale%",
		options: [
			" ", "xs", "s", "m", "l", "xl"
		],
	},
	invisible: {
		type: "list",
		label: "%invisible%",
		optionValuePairs: [
			["%on%", 1],
			["%off%", 2],
			["", 0]
		]
	},
	execute: {
		type: "button",
		click: modifyObject,
		label: "%apply%",
	}
};

function modifyObject() {
	for (const option of stringOptions) {
		if (optionsCache[option] !== "") {
			for (const point of pointSettingsArray)
				point[option] = optionsCache[option];
		}
	}
	for (const point of pointSettingsArray) {
		if (optionsCache.invisible !== 0)
			point.invisible = booleanValues[optionsCache.invisible];
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
	};
}