import LineSettings from "./objectSettings/LineSettings";
import pg from "./init";

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

	updateStyle: function(p: paper.Path) {
		
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

	createPoint: function() {
		var circle = new paper.Shape.Circle({
			center: new paper.Point(10, 10),
			radius: 5,
			fillColor: 'red'
		});
		circle.data.noDrawHandle = true;
		pg.undo.snapshot('createPoint');
		// circle.selectedColor = "white";
		return circle;
	},

	mergeLines: function() {
		let selection = pg.selection.getSelectedItems();
		if (selection.length !== 2) {
			console.error("Only possible with 2 lines");
			return;
		}
		if (selection[0].className !== "Path" || selection[0].className !== "Path") {
			console.error("Only lines");
			return;
		}

		selection[0].join(selection[1], 6);
		pg.undo.snapshot("mergeLines");
	}
}