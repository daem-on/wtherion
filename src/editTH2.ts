import LineSettings from "./objectSettings/model/LineSettings";
import getSettings, { PaperItemType } from "./objectSettings/model/getSettings";
import AreaSettings from "./objectSettings/model/AreaSettings";
import PointSettings from "./objectSettings/model/PointSettings";
import { getSelectedItems } from "./selection";
import { isPathItem } from "./item";

import colorDefs from "Res/color-defs.json";
import * as scrapOptions from "./scrapOptions";
import { snapshot } from "./undo";
import helper from "../js/helper";
import * as config from "./filesio/configManagement";

import paper from "paper";

const typeColors
	= generateColors(colorDefs.typeColors);
const pointColors
	= generateColors(colorDefs.pointColors);
const areaColors
	= generateColors(colorDefs.areaColors);

function generateColors(from: Record<string, string>) {
	const r: Record<string, paper.Color> = {};
	for (const entry in from) {
		r[entry] = new paper.Color(from[entry]);
		const inactive = r[entry].clone();
		inactive.saturation = 0.05;
		inactive.brightness = 0.7;
		r[entry + "-inactive"] = inactive;
	}
	return r;
}

export function overrideColors(object: Record<string, Record<string, string>>) {
	if ("lineColors" in object)
		Object.assign(typeColors, generateColors(object.lineColors));
	if ("pointColors" in object)
		Object.assign(pointColors, generateColors(object.pointColors));
	if ("areaColors" in object)
		Object.assign(areaColors, generateColors(object.areaColors));
	if ("background" in object)
		jQuery("#paperCanvas")
			.css("background-color", object.background["fill"]);
}

export default {
	
	createPath: function() {
		const path = new paper.Path();
		path.strokeColor = new paper.Color(0, 0, 0);
		path.strokeWidth = 2;
		path.data = {
			therionData: LineSettings.defaultSettings()
		};
		return path;
	},
	
	drawArea: function(a: paper.Path) {
		const settings = getSettings(a) as AreaSettings;
		this.drawLine(a, settings.lineSettings);
		this.setColorFromList(a, areaColors, settings.type, true);
	},

	drawPoint: function(p: paper.Shape) {
		const settings = getSettings(p) as PointSettings;
		const isStation = settings.type === "station";

		p.radius = settings.type === "station" ? 3 : 5;
		this.setColorFromList(p, pointColors, settings.type, true);
		// p.strokeColor = pointColors.default;
		// p.strokeWidth = 2;
	},
	
	drawLine: function(l: paper.Path, lineSettings?: LineSettings) {
		const settings = lineSettings || getSettings(l) as LineSettings;
		l.strokeScaling = true;
		l.fillColor = null;

		if (settings.type === "wall")
			l.strokeWidth = 2;
		else if (settings.type === "rock-edge")
			l.strokeWidth = 0.8;
		else
			l.strokeWidth = 1;
		
		this.setColorFromList(l, typeColors, settings.type);

		if (settings.subtype === "presumed")
			l.dashArray = [3, 6];
		else l.dashArray = null;
		l.strokeColor.alpha = settings.invisible ? 0.3 : 1;
	},
	
	drawObject: function(object: PaperItemType) {
		const settings = getSettings(object);
		if (!settings) return;

		switch (settings.className) {
			case "AreaSettings":
				this.drawArea(object as paper.Path);
				break;
			case "LineSettings":
				this.drawLine(object as paper.Path);
				break;
			case "PointSettings":
				this.drawPoint(object as paper.Shape);
				break;
		}
	},

	setColorFromList: function(
		object: PaperItemType,
		list: Record<string, paper.Color>,
		name: string,
		fill = false
	) {
		if (list[name] == null) name = "default";
		if (config.get("colorInactive"))
			if (paper.project.activeLayer !== object.layer)
				name += "-inactive";
		
		const color = list[name];
		if (fill) object.fillColor = color;
		else object.strokeColor = color;
	},

	updateInactiveScraps: function() {
		// only if enabled in config
		if (!config.get("colorInactive")) return;

		for (const layer of paper.project.layers) {
			const isActive = layer === paper.project.activeLayer;
			if (layer.visible
				&& layer.data.activeWhenLastDrawn !== isActive
				&& !layer.data.isGuideLayer) {

				for (const item of layer.children) {
					this.drawObject(item as PaperItemType);
				}
				layer.data.activeWhenLastDrawn = isActive;
			}
		}
	},
	
	setupData: function(item) {
		if (!("therionData" in item.data))
			item.data.therionData = {};
	},
	
	createPoint: function(pos: paper.Point = new paper.Point(0, 0)) {
		const circle = new paper.Shape.Circle({
			center: pos,
		});
		circle.data.fixedScale = true;
		circle.data.onlyRotateHandle = true;
		circle.data.therionData = PointSettings.defaultSettings();
		return circle;
	},

	lineToArea: function() {
		const selection = getSelectedItems();
		if (selection.length !== 1) return;

		const line = selection[0];
		const settings = getSettings(line as PaperItemType);
		if (!settings || settings.className !== "LineSettings") return;

		const oldSettings = settings;
		line.data.therionData = AreaSettings.defaultSettings();
		line.data.therionData.lineSettings = oldSettings;
		line.data.therionData.type = "water";
		this.drawArea(line as paper.Path);
	},

	areaToLine: function() {
		const selection = getSelectedItems();
		if (selection.length !== 1) return;

		const area = selection[0];
		const settings = getSettings(area as PaperItemType);
		if (!settings || settings.className !== "AreaSettings") return;

		const newSettings = area.data.therionData.lineSettings;
		area.data.therionData = newSettings;
		this.drawLine(area as paper.Path);
	},

	toggleItemsLocked: function() {
		const selection = getSelectedItems();
		for (const item of selection)
			item.locked = !item.locked;
		snapshot("Toggle locked");
	},

	changeStationsNamespace: function(addToEmpty = false) {
		const newNamespace = prompt("%edit.namespacePrompt%");
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
			if (item.className === "Shape") {
				const s = getSettings(item as paper.Shape);
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

	showScrapOptionsPanel: function() {
		scrapOptions.show();
	},
};