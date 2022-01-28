import { componentList } from "../js/toolOptionPanel";
import pg from "./init";
import getSettings from "./objectSettings/model/getSettings";
import ScrapSettings from "./objectSettings/model/ScrapSettings";

let optionsCache = {
	projection: "",
	scale: "",
	author: "",
	copyright: "",
	otherSettings: ""
};
let components: componentList = {
	projection: {
		type: "list",
		label: "Projection",
		optionValuePairs: [
			["none", 0],
			["plan", 1],
			["elevation", 2],
			["extended", 3]
		]
	},
	scale: {
		type: "text",
		label: "Scale"
	},
	author: {
		type: "text",
		label: "Author"
	},
	copyright: {
		type: "text",
		label: "Copyright"
	},
	otherSettings: {
		type: "text",
		label: "Other settings"
	},
};

export function show() {
	let scrap = pg.layer.getActiveLayer();
	let settings = getSettings(scrap);

	for (const key in optionsCache) {
		if (Object.prototype.hasOwnProperty.call(optionsCache, key)) {
			optionsCache[key] = settings[key];
		}
	}

	pg.toolOptionPanel.setup(
		optionsCache,
		components,
		() => {
			for (const key in optionsCache) {
				if (Object.prototype.hasOwnProperty.call(optionsCache, key))
					if (optionsCache[key] !== settings[key])
						settings[key] = optionsCache[key];
			}
		}
	);
}