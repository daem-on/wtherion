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
		type: "customList",
		label: "%scrap.projection%",
		options: ["plan", "[elevation 0]", "extended", "none"],
		imageRoot: "assets/projection"
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
			Object.assign(settings, optionsCache);
		}
	);
}