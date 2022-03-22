import { componentList } from "../../toolOptionPanel";
import LineSettings from "../model/LineSettings";
import getSettings from "../model/getSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
import pg from "../../init";
import subtypeList from "Res/subtype-list.json";
import { wallTypes } from "Res/wallTypes";
	
const optionsCache = {
	reverse: undefined,
	clip: undefined,
	outline: undefined,
	invisible: undefined,
	id: undefined,
	otherSettings: undefined,
	place: undefined,
	type: undefined,
	text: undefined,
	size: undefined,
	_subtypeWall: undefined,
	_subtypeBorder: undefined,
	_subtypeWater: undefined,
};
type comp = componentList<typeof optionsCache & {advancedSection}>;

const components: comp = {
	type: {
		type: "customList",
		label: "%type%",
		options: wallTypes,
	},
	_subtypeWall: {
		type: "customList",
		label: "%subtype%",
		requirements: {type: "wall"},
		options: subtypeList.wall,
		imageRoot: "assets/rendered/subtype"
	},
	_subtypeBorder: {
		type: "list",
		label: "%subtype%",
		requirements: {type: "border"},
		options: subtypeList.border,
	},
	_subtypeWater: {
		type: "customList",
		label: "%subtype%",
		requirements: {type: "water-flow"},
		options: subtypeList["water-flow"],
		imageRoot: "assets/rendered/subtype"
	},
	text: {
		type: "text",
		label: "%text%",
		requirements: {type: "label"}
	},
	reverse: {
		type: "boolean",
		label: "%reverse%"
	},
	invisible: {
		type: "boolean",
		label: "%invisible%"
	},
	size: {
		type: "int",
		label: "%size%",
		requirements: {
			type: "slope"
		}
	},
	outline: {
		type: "list",
		label: "%outline%",
		optionValuePairs: [
			["%default%", 0],
			["%in%", 1],
			["%out%", 2],
			["%none%", 3]
		],
	},
	advancedSection: {
		type: "title",
		text: "%advanced%"
	},
	id: {
		type: "text",
		label: "%id%"
	},
	otherSettings: {
		type: "text",
		label: "%otherSettings%"
	},
	clip: {
		type: "list",
		label: "%clip%",
		optionValuePairs: [
			["%default%", 0],
			["%on%", 1],
			["%off%", 2]
		],
	},
	place: {
		type: "list",
		label: "%place%",
		optionValuePairs: [
			["%top% ▲", 2],
			["%bottom% ▼", 1],
			["%default% ⦿", 0]
		]
	},
};
	
export default function(line: paper.Path): objectOptionPanelConfig {
	const settings = getSettings(line) as LineSettings;
	
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
	
	const modifyObject = () => {
		for (const key in optionsCache) {
			if (Object.prototype.hasOwnProperty.call(optionsCache, key)) {
				if (optionsCache[key] !== settings[key]) {
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
	};
	return {
		options: optionsCache,
		components: components,
		callback: modifyObject,
	};
}