import { isPathItem } from "./item";
import AreaSettings from "./objectSettings/model/AreaSettings";
import getSettings, { PaperItemType } from "./objectSettings/model/getSettings";
import { getSelectedItems } from "./selection";
import * as config from "./filesio/configManagement";
import { snapshot } from "./undo";
import paper from "paper";
import { updateWindow } from "./objectSettings/objectOptionPanel";
import { reactive } from "vue";
import { i18n } from "./i18n";
import { drawArea, drawLine, drawObject } from "./objectDefs.ts";
import { triggers } from "./triggers.ts";

const editTH2 = {
	updateInactiveScraps: function() {
		// only if enabled in config
		if (!config.get("colorInactive")) return;

		for (const layer of paper.project.layers) {
			const isActive = layer === paper.project.activeLayer;
			if (layer.visible
				&& layer.data.activeWhenLastDrawn !== isActive
				&& !layer.data.isGuideLayer) {

				for (const item of layer.children) {
					drawObject(item as PaperItemType);
				}
				layer.data.activeWhenLastDrawn = isActive;
			}
		}
	},

	lineToArea: function() {
		const selection = getSelectedItems();
		if (selection.length !== 1) return;

		const line = selection[0];
		const settings = getSettings(line as PaperItemType);
		if (!settings || settings.className !== "LineSettings") return;

		const oldSettings = settings;
		const lineData = reactive(line.data);
		lineData.therionData = AreaSettings.defaultSettings();
		lineData.therionData.lineSettings = oldSettings;
		lineData.therionData.type = "water";
		drawArea(line as paper.Path);
		updateWindow();
	},

	areaToLine: function() {
		const selection = getSelectedItems();
		if (selection.length !== 1) return;

		const area = selection[0];
		const settings = getSettings(area as PaperItemType);
		if (!settings || settings.className !== "AreaSettings") return;

		const newSettings = area.data.therionData.lineSettings;
		reactive(area.data).therionData = newSettings;
		drawLine(area as paper.Path);
		updateWindow();
	},

	toggleItemsLocked: function() {
		const selection = getSelectedItems();
		for (const item of selection)
			item.locked = !item.locked;
		snapshot("Toggle locked");
	},

	unlockSelection: function() {
		const selection = getSelectedItems();
		for (const item of selection)
			item.locked = false;
		snapshot("Unlock selection");
	},

	changeStationsNamespace: function(addToEmpty = false) {
		const newNamespace = prompt(i18n.global.t("edit.namespacePrompt"));
		if (!newNamespace) return;

		for (const item of paper.project.getItems({ recursive: true })) {
			const settings = getSettings(item as any);
			if (!settings || settings.className !== "PointSettings") continue;
			if (settings.type !== "station") continue;
			if (settings.name.includes("@")) {
				const name = settings.name.split("@")[0];
				settings.name = `${name}@${newNamespace}`;
			} else if (addToEmpty) {
				settings.name = `${settings.name}@${newNamespace}`;
			}
		}
	},

	randomizeRotation: function() {
		const selection: paper.Item[] = getSelectedItems();
		for (const item of selection) {
			if (item.className === "SymbolItem") {
				const s = getSettings(item as paper.SymbolItem);
				if (s.className === "PointSettings") {
					item.rotation = Math.floor(Math.random() * 360);
					s.rotation = item.rotation;
				}
			}
		}
	},

	mergeLines: function() {
		const selection = getSelectedItems();
		if (selection.length !== 2) {
			console.error("Only possible with 2 lines");
			return;
		}
		if (!isPathItem(selection[0]) || !isPathItem(selection[1])) {
			console.error("Only lines");
			return;
		}

		selection[0].join(selection[1], 6);
		snapshot("mergeLines");
	},

	smooth: function() {
		const selection = getSelectedItems();

		for (const item of selection)
			if (isPathItem(item)) item.smooth();

		snapshot("smoothLine");
	},

	simplify: function() {
		const selection = getSelectedItems();

		for (const item of selection)
			if (isPathItem(item)) item.simplify();

		snapshot("simplifyLine");
	},
};

triggers.on("LayersChanged", () => editTH2.updateInactiveScraps());

export default editTH2;