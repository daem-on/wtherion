import { componentList } from "./toolOptionPanel";
import pg from "./init";
import getSettings from "./objectSettings/model/getSettings";
import ScrapSettings from "./objectSettings/model/ScrapSettings";

const optionsCache = {
	projection: "",
	scale: "",
	author: "",
	copyright: "",
	otherSettings: ""
};
const components: componentList<typeof optionsCache> = {
	projection: {
		type: "list",
		label: "%scrap.projection%",
		optionValuePairs: [
			["none", 0],
			["plan", 1],
			["elevation", 2],
			["extended", 3]
		]
	},
	scale: {
		type: "text",
		label: "%scale%"
	},
	author: {
		type: "text",
		label: "%scrap.author%"
	},
	copyright: {
		type: "text",
		label: "%scrap.copyright%"
	},
	otherSettings: {
		type: "text",
		label: "%otherSettings%"
	},
};

export function show() {
	const scrap = pg.layer.getActiveLayer();
	const settings = getSettings(scrap);

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