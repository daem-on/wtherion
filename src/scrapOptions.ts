import * as layer from "./layer";
import getSettings from "./objectSettings/model/getSettings";
import toolOptionPanel, { componentList } from "./toolOptionPanel";

const optionsCache = {
	projection: "",
	scale: "",
	author: "",
	copyright: "",
	stationNames: "",
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
	stationNames: {
		type: "text",
		label: "%scrap.stationNames%"
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

	jQuery('.toolOptionPanel').remove();

	toolOptionPanel.setupFloating(
		optionsCache,
		components,
		() => {
			Object.assign(settings, optionsCache);
		},
		"%scrapSettingsTitle%"
	);
}