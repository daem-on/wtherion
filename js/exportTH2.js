function toGlobal(global, local= [0, 0]) {
	return `${global[0]+local[0]} ${-(global[1]+local[1])}`
}

_exportText = ""
function logText(...data) {
	_exportText += data.join(" ") + "\n";
}

exportTh2 = function () {
	_exportText = ""
	data = paper.project.exportJSON({asString: false});

	items = data[0][1].children;

	for (item of items) {
		if (item[0] == "Path") {
			segments = item[1].segments;
			if (segments.length == 0) continue;

			var settings = "";
			var segmentOptions = {};
			if (item[1].data && "therionData" in item[1].data) {
				thData = item[1].data.therionData;
				if ("lineType" in thData)
					settings += thData.lineType;
				if ("segmentOptions" in thData)
					segmentOptions = thData.segmentOptions;
			}
			logText("line " + settings);
			
			if (item[1].closed) logText("close on");

			firstPrinted = false;
			prevControlPoint = "";
			for ([index, segment] of segments.entries()) {
				var isCurved = (segment.length >= 3);

				if (!firstPrinted) {
					logText(toGlobal(isCurved ? segment[0] : segment));
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

			logText("endline")
		} else if (item[0] == "CompoundPath") {
			items.concat(item[1].children);
		}
	}

	console.log(_exportText);
}