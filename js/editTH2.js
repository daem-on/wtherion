pg.editTH2 = {
	lineTypeTest: function() {
		var items = pg.selection.getSelectedItems();
		for (var item of items) {
			this.setupData(item);
			item.data.therionData.lineType =
				prompt("Type", "wall");
		}
	},

	subtypeTest: function() {
		var items = pg.selection.getSelectedItems();
		for (var item of items) {
			if (!"segments" in item) continue;
			this.setupData(item);

			thData = item.data.therionData;
			if (!thData.segmentOptions) thData.segmentOptions = {};
			for (segment of item.segments) {
				if (segment.selected)
					thData.segmentOptions[segment.index] =
						"subtype " + prompt("Subtype", "sand");
			}
		}
	},

	clearSubtype: function() {
		var items = pg.selection.getSelectedItems();
		for (var item of items) {
			if (!"segments" in item) continue;
			if (!item.data.therionData?.segmentOptions) continue;
			var opt = item.data.therionData.segmentOptions;
			for (segment of item.segments) {
				if (segment.selected && opt[segment.index])
					delete opt[segment.index];
			}
		}
	},

	setupData: function(item) {
		if (!("therionData" in item.data))
			item.data.therionData = {};
	}
}