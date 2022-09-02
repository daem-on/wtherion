import toolOptionPanel, { componentList } from "./toolOptionPanel";
import getSettings from "./objectSettings/model/getSettings";
import ScrapSettings from "./objectSettings/model/ScrapSettings";
import layer from "../js/layer";

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
		type: "textarea",
		label: "%otherSettings%",
		// minWidth: 300
	},
};

export function show() {
	const scrap = layer.getActiveLayer();
	const settings = getSettings(scrap);

	for (const key in optionsCache) {
		if (Object.prototype.hasOwnProperty.call(optionsCache, key)) {
			optionsCache[key] = settings[key];
		}
	}

	toolOptionPanel.setupFloating(
		optionsCache,
		components,
		() => {
			Object.assign(settings, optionsCache);
		},
		"%scrapSettingsTitle%"
	);
}