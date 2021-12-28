import LineSettings from "./objectSettings/model/LineSettings";
import pg from "./init";
import getSettings from "./objectSettings/model/getSettings";
import AreaSettings from "./objectSettings/model/AreaSettings";
import PointSettings from "./objectSettings/model/PointSettings";
	
const typeColors = {
	"default": new paper.Color(0, 0, 0),
	"rock-border": new paper.Color(0.3125 ,0.2421875, 0.3984375),
	"rock-edge": new paper.Color(0.3125 ,0.2421875, 0.3984375),
	"contour": new paper.Color(0.24609375 ,0.4375, 0.25),
	"border": new paper.Color(0.26953125 ,0.70703125, 0.671875),
	"pit": new paper.Color(0.6875 ,0.13671875, 0.61328125),
	"wall": new paper.Color(0.14453125 ,0.1640625, 0.3671875),
	"slope": new paper.Color(0.875 ,0.7734375, 0.18359375),
}
const pointColors = {
	"default": new paper.Color(1, 0, 0),
	"station": new paper.Color(0.875 ,0.7734375, 0.18359375),
}
	
export default {
	lineTypeTest: function() {
		var items = pg.selection.getSelectedItems();
		for (var item of items) {
			this.setupData(item);
			item.data.therionData.lineType =
				prompt("Type", "wall");
		}
		pg.undo.snapshot('setLineType');
	},
	
	createPath: function() {
		var path = new paper.Path();
		path.strokeColor = new paper.Color(0, 0, 0);
		path.strokeWidth = 2;
		path.data = {
			therionData: LineSettings.defaultSettings()
		};
		return path;
	},
	
	drawArea: function(a: paper.Path) {
		let settings = getSettings(a) as AreaSettings;
		this.drawLine(a, settings.lineSettings);
		a.fillColor = new paper.Color(0.2, 0.2, 0.2, 0.2);
	},

	drawPoint: function(p: paper.Shape) {
		let settings = getSettings(p) as PointSettings;
		let isStation = settings.type === "station"

		p.radius = isStation ? 3 : 5;
		p.fillColor = isStation ? pointColors.station : pointColors.default;
		// p.strokeColor = pointColors.default;
		// p.strokeWidth = 2;
	},
	
	drawLine: function(l: paper.Path, lineSettings?: LineSettings) {
		let settings = lineSettings || getSettings(l) as LineSettings;
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
	},
	
	drawObject: function(object: paper.Item) {
		let settings = getSettings(object);
		if (!settings) return;
		if (settings.className == "AreaSettings") {
			this.drawArea(object as paper.Path);
		} else if (settings.className == "LineSettings") {
			this.drawLine(object as paper.Path);
		}
	},
	
	subtypeTest: function() {
		var items = pg.selection.getSelectedItems();
		for (var item of items) {
			if (!("segments" in item)) continue;
			this.setupData(item);
	
			let thData = item.data.therionData;
			if (!thData.segmentOptions) thData.segmentOptions = {};
			for (let segment of item.segments) {
				if (segment.selected)
					thData.segmentOptions[segment.index] =
						"subtype " + prompt("Subtype", "sand");
			}
		}
		pg.undo.snapshot('setSubtype');
	},
	
	pointSettings: function() {
		var items = pg.selection.getSelectedItems();
		for (var item of items) {
			if (item.className != "Shape") continue;
			this.setupData(item);
	
			let thData = item.data.therionData;
			thData.pointSettings = prompt("Point settings", thData.pointSettings)
		}
		pg.undo.snapshot('setPointSettings');
	},
	
	clearSubtype: function() {
		var items = pg.selection.getSelectedItems();
		for (var item of items) {
			if (!("segments" in item)) continue;
			if (!item.data.therionData?.segmentOptions) continue;
			var opt = item.data.therionData.segmentOptions;
			for (let segment of item.segments) {
				if (segment.selected && opt[segment.index])
					delete opt[segment.index];
			}
		}
		pg.undo.snapshot('clearSubtype');
	},
	
	setupData: function(item) {
		if (!("therionData" in item.data))
			item.data.therionData = {};
	},
	
	createPoint: function(pos: paper.Point = new paper.Point(0, 0)) {
		var circle = new paper.Shape.Circle({
			center: pos,
		});
		circle.data.noDrawHandle = true;
		circle.data.therionData = PointSettings.defaultSettings();
		return circle;
	},

	lineToArea: function() {
		let selection = pg.selection.getSelectedItems();
		if (selection.length !== 1) return;

		let line = selection[0]
		let settings = getSettings(line);
		if (!settings || settings.className !== "LineSettings") return;

		let oldSettings = settings
		line.data.therionData = AreaSettings.defaultSettings();
		line.data.therionData.lineSettings = oldSettings;
		line.data.therionData.type = "water";
		this.drawArea(line);
	},

	areaToLine: function() {
		let selection = pg.selection.getSelectedItems();
		if (selection.length !== 1) return;

		let area = selection[0]
		let settings = getSettings(area);
		if (!settings || settings.className !== "AreaSettings") return;

		let newSettings = area.data.therionData.lineSettings;
		area.data.therionData = newSettings;
		this.drawLine(area);
	},
	
	mergeLines: function() {
		let selection = pg.selection.getSelectedItems();
		if (selection.length !== 2) {
			console.error("Only possible with 2 lines");
			return;
		}
		if (selection[0].className !== "Path" || selection[1].className !== "Path") {
			console.error("Only lines");
			return;
		}
	
		selection[0].join(selection[1], 6);
		pg.undo.snapshot("mergeLines");
	},
	
	smooth: function() {
		let selection = pg.selection.getSelectedItems();
		
		for (let item of selection)
			if (item.className == "Path") item.smooth();
	
		pg.undo.snapshot("smoothLine");
	},

	simplify: function() {
		let selection = pg.selection.getSelectedItems();
		
		for (let item of selection)
			if (item.className == "Path") item.simplify();
	
		pg.undo.snapshot("simplifyLine");
	}
}