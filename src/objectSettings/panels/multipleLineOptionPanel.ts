import { componentList } from "../../../js/toolOptionPanel";
import LineSettings from "../model/LineSettings";
import getSettings from "../model/getSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
import pg from "../../init";
import wallList from "../../../js/res/walls-list.json";
import subtypeList from "../../../js/res/subtype-list.json";

const wallTypes = [""].concat(wallList.passages)

const defaultOptions = () => ({
	type: "",
	subtype: ""
});

let optionsCache = defaultOptions();
let lineArray: paper.Path[];
let lineSettingsArray: LineSettings[];
	
const components: componentList = {
	type: {
		type: "customList",
		label: "Type",
		options: wallTypes,
	},
	subtype: {
		type: "customList",
		label: "Subtype",
		requirements: {type: ["wall", "border", "water-flow"]},
		options: subtypeList.wall.concat(subtypeList.border).concat(subtypeList["water-flow"]),
		imageRoot: "assets/rendered/subtype"
	},
	execute: {
		type: "button",
		click: modifyObject,
		label: "Execute change",
	}
}

function modifyObject() {
	for (let option in optionsCache) {
		if (optionsCache[option] !== "") {
			for (let line of lineSettingsArray)
				line[option] = optionsCache[option];
		}
	}
	for (let line of lineArray) pg.editTH2.drawLine(line);
}

export default function(lines: paper.Path[]): objectOptionPanelConfig {
	lineArray = lines;
	lineSettingsArray = [];
	optionsCache = defaultOptions();
	for (let line of lines)
		lineSettingsArray.push(getSettings(line) as LineSettings);

	return {
		options: optionsCache,
		components: components,
		callback: () => {},
	}
}