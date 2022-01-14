import { componentList } from "../../../js/toolOptionPanel";
import LineSettings from "../model/LineSettings";
import getSettings from "../model/getSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
import pg from "../../init";
import wallList from "../../../js/res/walls-list.json";
import subtypeList from "../../../js/res/subtype-list.json";
	
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
	_subtypeWall: undefined,
	_subtypeBorder: undefined,
	_subtypeWater: undefined,
};
	
const components: componentList = {
	type: {
		type: "customList",
		label: "Type",
		options: wallTypes,
	},
	_subtypeWall: {
		type: "customList",
		label: "Subtype",
		requirements: {type: "wall"},
		options: subtypeList.wall,
		imageRoot: "/assets/rendered/subtype"
	},
	_subtypeBorder: {
		type: "list",
		label: "Subtype",
		requirements: {type: "border"},
		options: subtypeList.border,
	},
	_subtypeWater: {
		type: "customList",
		label: "Subtype",
		requirements: {type: "water-flow"},
		options: subtypeList["water-flow"],
		imageRoot: "/assets/rendered/subtype"
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
	let settings = getSettings(line) as LineSettings;
	
	for (const key in optionsCache) {
		if (Object.prototype.hasOwnProperty.call(optionsCache, key)) {
			optionsCache[key] = settings[key];
		}
	}
	switch (settings.type) {
		case "wall": optionsCache._subtypeWall = settings.subtype; break;
		case "border": optionsCache._subtypeBorder = settings.subtype; break;
		case "water-flow": optionsCache._subtypeWater = settings.subtype; break;
	}
	
	let modifyObject = () => {
		for (const key in optionsCache) {
			if (Object.prototype.hasOwnProperty.call(optionsCache, key)) {
				if (optionsCache[key] != settings[key]) {
					settings[key] = optionsCache[key];
				}
			}
		}
		switch (optionsCache.type) {
			case "wall": settings.subtype = optionsCache._subtypeWall; break;
			case "border": settings.subtype = optionsCache._subtypeBorder; break;
			case "water-flow": settings.subtype = optionsCache._subtypeWater; break;
			default: settings.subtype = "";
		}
		pg.editTH2.drawLine(line);
	}
	return {
		options: optionsCache,
		components: components,
		callback: modifyObject,
	}
}