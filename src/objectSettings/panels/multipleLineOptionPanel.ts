import { componentList } from "../../toolOptionPanel";
import LineSettings from "../model/LineSettings";
import getSettings from "../model/getSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
import pg from "../../init";
import wallList from "Res/walls-list.json";
import subtypeList from "Res/subtype-list.json";

const wallTypes = [""].concat(wallList.passages);

const defaultOptions = () => ({
	type: "",
	subtype: ""
});

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
	execute: {
		type: "button",
		click: modifyObject,
		label: "%apply%",
	}
};

function modifyObject() {
	for (const option in optionsCache) {
		if (optionsCache[option] !== "") {
			for (const line of lineSettingsArray)
				line[option] = optionsCache[option];
		}
	}
	for (const line of lineArray) pg.editTH2.drawLine(line);
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