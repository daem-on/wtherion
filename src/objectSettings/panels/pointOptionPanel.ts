import { componentList } from "../../toolOptionPanel";
import getSettings from "../model/getSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
import pg from "../../init";
import symbolList from "Res/symbol-list.json";

// const types = symbolList["special objects"]
// 	.concat(symbolList["symbolic passage fills"]);
const types = [];
for (const category in symbolList)
	types.push(symbolList[category]);

const optionsCache = {
	type: undefined,
	otherSettings: undefined,
	name: undefined,
	clip: undefined,
	scale: undefined,
	place: undefined,
	invisible: undefined,
	text: undefined,
	value: undefined,
	id: undefined,
};
type comp = componentList<typeof optionsCache & {advancedSection}>;

const components: comp = {
	type: {
		// type: "customList",
		// imageRoot: "assets/rendered/symbol",
		type: "list",
		label: "%type%",
		options: types
	},
	invisible: {
		type: "boolean",
		label: "%invisible%"
	},
	value: {
		type: "text",
		requirements: {
			type: ["height", "passage-height", "altitude", "dimensions"]
		},
		label: "%value%"
	},
	text: {
		requirements: {
			type: ["label", "remark", "continuation"]
		},
		type: "text",
		label: "%text%"
	},
	name: {
		type: "text",
		label: "%stationName%",
		requirements: {
			type: "station"
		}
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
			["default", 0],
			["on", 1],
			["off", 2]
		],
	},
	scale: {
		type: "list",
		label: "%scale%",
		options: [
			"xs", "s", "m", "l", "xl"
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

export default function(shape: paper.Shape): objectOptionPanelConfig {
	const settings = getSettings(shape);
	
	for (const key in optionsCache) {
		if (Object.prototype.hasOwnProperty.call(optionsCache, key)) {
			optionsCache[key] = settings[key];
		}
	}
	
	const modifyObject = () => {
		Object.assign(settings, optionsCache);
		pg.editTH2.drawPoint(shape);
	};
	return {
		options: optionsCache,
		components: components,
		callback: modifyObject,
	};
}