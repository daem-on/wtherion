function toGlobal(global, local= [0, 0]) {
	x = Math.round((global[0]+local[0])*100)/100;
	y = -Math.round((global[1]+local[1])*100)/100;
	return `${x} ${y}`
}
	
_exportText = ""
function logText(...data) {
	_exportText += data.join(" ") + "\n";
}
	
var exporterTh2 = {
	exportTh2: function() {
		_exportText = ""
	
		//prepare items
		for (item of paper.project.getItems({className:"Shape"})) {
			if (item.className == "Shape" && item.data && item.data.therionData) {
				var rot = item.rotation % 360;
		
				if (rot < 0) rot += 360;
				item.data.therionData.rotation = rot;
			}
		}
		
		data = paper.project.exportJSON({asString: false, precision: 2});
	
		for (layer of data) {
			if (layer[0] != "Layer") continue;
			if (layer[1].data && layer[1].data.isGuideLayer) continue;
			this.processLayer(layer[1]);
		}
		items = data[0][1].children;
	
		
		console.log(_exportText);
	},
	
	_testSettings: "-projection plan -scale [2416.0 -1364.5 2451.0 -1364.5 0.0 0.0 1.5 0.0 m]",
	
	processLayer: function(layer) {
		if (!layer.children || layer.children.length == 0) return;
		
		logText("scrap", layer.name, this._testSettings);
		for (item of layer.children) {
			switch (item[0]) {
			case "Path":
				this.processLine(item[1]);
				break;
			case "CompoundPath":
				this.processCompoundPath(item[1]);
				break;
			case "Shape":
				this.processShape(item[1]);
				break;
			}
		}
		logText("endscrap");
	},
	
	processLine: function(item) {
		segments = item.segments;
		if (segments.length == 0) return;
	
		var settings = "";
		var segmentOptions = {};
		if (item.data && "therionData" in item.data) {
			thData = item.data.therionData;
			if ("lineType" in thData)
				settings += thData.lineType;
			if ("segmentOptions" in thData)
				segmentOptions = thData.segmentOptions;
		}
		logText("line " + settings);
			
		if (item.closed) logText("close on");
	
		var firstPrinted = false;
		var prevControlPoint = "";
		var firstOutput
		for ([index, segment] of segments.entries()) {
			var isCurved = (segment.length >= 3);
	
			if (!firstPrinted) {
				firstOutput = toGlobal(isCurved ? segment[0] : segment)
				logText(firstOutput);
				firstPrinted = true;
			}
			else isCurved ? logText(
				prevControlPoint,
				toGlobal(segment[0], segment[1]),
				toGlobal(segment[0])
			) : logText(
				toGlobal(segment)
			);
	
			if (index in segmentOptions) {
				logText(segmentOptions[index]);
			}
	
			prevControlPoint = isCurved ?
				toGlobal(segment[0], segment[2])
				: toGlobal(segment);
		}
	
		if (item.closed) logText(firstOutput);
		logText("endline")
	},
	
	processCompoundPath: function(item) {
		for (child of item.children)
			this.processLine(child);
	},
	
	processShape: function(item) {
		var shape = item;
		if (shape.data && "therionData" in shape.data) {
			var out = [
				"point",
				toGlobal(shape.matrix.slice(4, 6)),
				shape.data.therionData.pointSettings
			];
			if (shape.data.therionData.orientation !== 0)
				out.push("-orient", shape.data.therionData.rotation);
			logText(out);
		}
	}
}