import LineSettings from "./objectSettings/model/LineSettings";
import pg from "./init";
import getSettings, { PaperItemType } from "./objectSettings/model/getSettings";
import AreaSettings from "./objectSettings/model/AreaSettings";
import PointSettings from "./objectSettings/model/PointSettings";

import colorDefs from "./res/color-defs.json";
import * as scrapOptions from "./scrapOptions";

const typeColors
	= generateColors(colorDefs.typeColors);
const pointColors
	= generateColors(colorDefs.pointColors);
const areaColors
	= generateColors(colorDefs.areaColors);

function generateColors(from: Record<string, string>) {
	const r: Record<string, paper.Color> = {};
	for (const entry in from) r[entry] = new paper.Color(from[entry]);
	return r;
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
		a.fillColor = new paper.Color(0.2, 0.2, 0.2, 0.2);
		a.fillColor = (settings.type in areaColors) ?
			areaColors[settings.type] : areaColors.default;
	},

	drawPoint: function(p: paper.Shape) {
		const settings = getSettings(p) as PointSettings;
		const isStation = settings.type === "station"

		p.radius = isStation ? 3 : 5;
		p.fillColor = isStation ? pointColors.station : pointColors.default;
		// p.strokeColor = pointColors.default;
		// p.strokeWidth = 2;
	},
	
	drawLine: function(l: paper.Path, lineSettings?: LineSettings) {
		const settings = lineSettings || getSettings(l) as LineSettings;
		l.strokeScaling = true;
		l.fillColor = null;

		if (settings.type == "wall")
			l.strokeWidth = 2;
		else if (settings.type == "rock-edge")
			l.strokeWidth = 0.8;
		else
			l.strokeWidth = 1;
		
		if (settings.type in typeColors)
			l.strokeColor = typeColors[settings.type];
		else
			l.strokeColor = typeColors.default;
		if (settings.subtype === "presumed")
			l.dashArray = [3, 6];
		else l.dashArray = null;
	},
	
	drawObject: function(object: PaperItemType) {
		const settings = getSettings(object);
		if (!settings) return;
		if (settings.className == "AreaSettings") {
			this.drawArea(object as paper.Path);
		} else if (settings.className == "LineSettings") {
			this.drawLine(object as paper.Path);
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
		circle.data.noDrawHandle = true;
		circle.data.therionData = PointSettings.defaultSettings();
		return circle;
	},

	lineToArea: function() {
		const selection = pg.selection.getSelectedItems();
		if (selection.length !== 1) return;

		const line = selection[0]
		const settings = getSettings(line as PaperItemType);
		if (!settings || settings.className !== "LineSettings") return;

		const oldSettings = settings
		line.data.therionData = AreaSettings.defaultSettings();
		line.data.therionData.lineSettings = oldSettings;
		line.data.therionData.type = "water";
		this.drawArea(line as paper.Path);
	},

	areaToLine: function() {
		const selection = pg.selection.getSelectedItems();
		if (selection.length !== 1) return;

		const area = selection[0]
		const settings = getSettings(area as PaperItemType);
		if (!settings || settings.className !== "AreaSettings") return;

		const newSettings = area.data.therionData.lineSettings;
		area.data.therionData = newSettings;
		this.drawLine(area as paper.Path);
	},
	
	randomizeRotation: function() {
		const selection: paper.Item[] = pg.selection.getSelectedItems();
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
		const selection = pg.selection.getSelectedItems();
		if (selection.length !== 2) {
			console.error("Only possible with 2 lines");
			return;
		}
		if (!pg.item.isPathItem(selection[0]) || !pg.item.isPathItem(selection[1])) {
			console.error("Only lines");
			return;
		}
	
		selection[0].join(selection[1], 6);
		pg.undo.snapshot("mergeLines");
	},
	
	smooth: function() {
		const selection = pg.selection.getSelectedItems();
		
		for (const item of selection)
			if (pg.item.isPathItem(item)) item.smooth();
	
		pg.undo.snapshot("smoothLine");
	},

	simplify: function() {
		const selection = pg.selection.getSelectedItems();
		
		for (const item of selection)
			if (pg.item.isPathItem(item)) item.simplify();
	
		pg.undo.snapshot("simplifyLine");
	},

	showScrapOptionsPanel: function() {
		scrapOptions.show();
	},
}