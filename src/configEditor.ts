import toolOptionPanel, { componentList } from "./toolOptionPanel";
import { updateLayerList } from "./layerPanel";
import * as wtConf from "./filesio/configManagement";

const optionsCache = {
	detailSelectGuides: false,
	showSegmentOptionPanel: false,
	lockLayerNames: false,
	githubToken: "",
	inspectTolerance: 8,
	colorInactive: false,
	saveHandler: "localStorage"
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
	},
	githubToken: {
		type: "text",
		label: "%config.githubToken%",
		tooltip: "%config.githubToken.tooltip%"
	},
	inspectTolerance: {
		type: "int",
		label: "%config.inspectTolerance%",
		min: 0,
	},
	colorInactive: {
		type: "boolean",
		label: "%config.colorInactive%"
	},
	saveHandler: {
		type: "list",
		label: "%config.saveHandler%",
		optionValuePairs: [
			["%config.saveHandler.localStorage%", "localStorage"],
			["%config.saveHandler.fileSystem%", "fileSystem"]
		]
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

	toolOptionPanel.setupFloating(
		optionsCache,
		components,
		() => {
			wtConf.assign(optionsCache);

			// update because lockLayerNames might have changed
			updateLayerList();
		},
		"%configTitle%"
	);
}