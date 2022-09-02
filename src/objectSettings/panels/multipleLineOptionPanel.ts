import { componentList } from "../../toolOptionPanel";
import LineSettings from "../model/LineSettings";
import getSettings from "../model/getSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
import editTH2 from "../../editTH2";
import wallList from "Res/walls-list.json";
import subtypeList from "Res/subtype-list.json";

const wallTypes = [""].concat(wallList.passages);

const defaultOptions = () => ({
	type: "",
	subtype: "",
	reverse: 0,
	invisible: 0
});

const stringOptions = ["type", "subtype"];
const booleanValues = [null, true, false];
let optionsCache = defaultOptions();
let lineArray: paper.Path[];
let lineSettingsArray: LineSettings[];

type comp = componentList<typeof optionsCache & {execute}>;
	
const components: comp = {
	type: {
		type: "customList",
		label: "%type%",
		options: wallTypes,
	},
	subtype: {
		type: "customList",
		label: "%subtype%",
		requirements: {type: ["wall", "border", "water-flow"]},
		options: subtypeList.wall.concat(subtypeList.border).concat(subtypeList["water-flow"]),
		imageRoot: "assets/rendered/subtype"
	},
	reverse: {
		type: "list",
		label: "%reverse%",
		optionValuePairs: [
			["%on%", 1],
			["%off%", 2],
			["", 0]
		]
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
			for (const line of lineSettingsArray)
				line[option] = optionsCache[option];
		}
	}
	for (const line of lineSettingsArray) {
		if (optionsCache.reverse !== 0)
			line.reverse = booleanValues[optionsCache.reverse];
		if (optionsCache.invisible !== 0)
			line.invisible = booleanValues[optionsCache.invisible];
	}
	for (const line of lineArray) editTH2.drawLine(line);
}

export default function(lines: paper.Path[]): objectOptionPanelConfig {
	lineArray = lines;
	lineSettingsArray = [];
	optionsCache = defaultOptions();
	for (const line of lines)
		lineSettingsArray.push(getSettings(line) as LineSettings);

	return {
		options: optionsCache,
		components: components,
		callback: () => {},
	};
}