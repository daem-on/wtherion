import { componentList } from "./toolOptionPanel";
import pg from "./init";
import * as wtConf from "./configManagement";

const optionsCache = {
	detailSelectGuides: false,
	showSegmentOptionPanel: false,
	lockLayerNames: false
};
const components: componentList<typeof optionsCache> = {
	detailSelectGuides: {
		type: "boolean",
		label: "%config.detailSelectGuides%"
	},
	showSegmentOptionPanel: {
		type: "boolean",
		label: "%config.showSegmentOptionPanel%"
	},
	lockLayerNames: {
		type: "boolean",
		label: "%config.lockLayerNames%"
	}
};

export function show() {
	wtConf.loadConfig();

	for (const key in optionsCache) {
		if (Object.prototype.hasOwnProperty.call(optionsCache, key)) {
			if (wtConf.exists(key))
				optionsCache[key] = wtConf.get(key);
		}
	}

	pg.toolOptionPanel.setupFloating(
		optionsCache,
		components,
		() => {
			wtConf.assign(optionsCache);
		},
		"%configTitle%"
	);
}