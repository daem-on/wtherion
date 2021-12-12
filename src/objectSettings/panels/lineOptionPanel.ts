import { componentList } from "../../../js/toolOptionPanel";
import LineSettings from "../model/LineSettings";
import getSettings from "../model/getSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
import pg from "../../init";
import wallList from "../../../js/res/walls-list.json";

const wallTypes = wallList.labels
	.concat(wallList.passages)
	.concat(wallList["passage fills"])
	.concat(wallList.special);

let optionsCache = {
	reverse: undefined,
	clip: undefined,
	outline: undefined,
	invisible: undefined,
	id: undefined,
	otherSettings: undefined,
	place: undefined,
	type: undefined,
	size: undefined,
};

const components: componentList = {
	type: {
		type: "customList",
		label: "Type",
		options: wallTypes,
	},
	reverse: {
		type: "boolean",
		label: "Reverse"
	},
	invisible: {
		type: "boolean",
		label: "Invisible"
	},
	size: {
		type: "int",
		label: "Size",
		requirements: {
			type: "slope"
		}
	},
	outline: {
		type: "list",
		label: "Outline",
		optionValuePairs: [
			["default", 0],
			["in", 1],
			["out", 2],
			["none", 3]
		],
	},
	advancedSection: {
		type: "title",
		text: "Advanced"
	},
	id: {
		type: "text",
		label: "id"
	},
	otherSettings: {
		type: "text",
		label: "Other settings"
	},
	clip: {
		type: "list",
		label: "Clip",
		optionValuePairs: [
			["default", 0],
			["on", 1],
			["off", 2]
		],
	},
	place: {
		type: "list",
		label: "Place",
		optionValuePairs: [
			["top ▲", 2],
			["bottom ▼", 1],
			["default ⦿", 0]
		]
	},
}

export default function(line: paper.Path): objectOptionPanelConfig {
	let settings = getSettings(line);
	
	for (const key in optionsCache) {
		if (Object.prototype.hasOwnProperty.call(optionsCache, key)) {
			optionsCache[key] = settings[key];
		}
	}
	
	let modifyObject = () => {
		for (const key in optionsCache) {
			if (Object.prototype.hasOwnProperty.call(optionsCache, key)) {
				if (optionsCache[key] != settings[key]) {
					settings[key] = optionsCache[key];
				}
			}
		}
	}
	return {
		options: optionsCache,
		components: components,
		callback: modifyObject,
	}
}