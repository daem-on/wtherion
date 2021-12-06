import { componentList } from "../../../js/toolOptionPanel";
import LineSettings, { getSettings } from "../LineSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
import pg from "../../init";
import wallTypes from "../../../js/res/walls-list.json";

let optionsCache = {
	reverse: undefined,
	clip: undefined,
	outline: undefined,
	invisible: undefined,
	advancedSection: undefined,
	id: undefined,
	otherSettings: undefined,
	place: undefined,
	type: undefined,
};

const components: componentList = {
	type: {
		type: "customLine",
		label: "Type",
		options: wallTypes.passages,
	},
	reverse: {
		type: "boolean",
		label: "Reverse"
	},
	invisible: {
		type: "boolean",
		label: "Invisible"
	},
	outline: {
		type: "list",
		label: "Outline",
		options: ["in", "out", "none"]
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
		options: ["-", "on", "off"],
	},
	place: {
		type: "list",
		label: "Place",
		options: ["bottom", "default", "top"]
	},
}

const sizeComponent: componentList = {
	size: {
		type: "int",
		label: "Size"
	}
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
		pg.toolOptionPanel.update({
			outline: settings.outline,
		});
	}
	return {
		options: optionsCache,
		components: components,
		callback: modifyObject,
	}
}