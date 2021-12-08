import paper from "paper";
import LineSettings, { getSettings } from "../objectSettings/LineSettings";
import { saveAs } from "file-saver";

function toGlobal(global, local= [0, 0]) {
	let x = Math.round((global[0]+local[0])*100)/100;
	let y = -Math.round((global[1]+local[1])*100)/100;
	return `${x} ${y}`
}
	
let _exportText = ""
function logText(...data) {
	_exportText += data.join(" ") + "\n";
}

export function asBlob() {
	return new Blob([exportTh2()], {type: "text/th2"});
}

export function save() {
	saveAs(asBlob(), "export.th2");
}

export function exportTh2() {
	_exportText = ""

	//prepare items
	for (let item of paper.project.getItems({className:"Shape"})) {
		if (item.className == "Shape" && item.data && item.data.therionData) {
			var rot = item.rotation % 360;
	
			if (rot < 0) rot += 360;
			item.data.therionData.rotation = rot;
		}
	}
	
	let data = paper.project.exportJSON({asString: false, precision: 2}) as any;

	for (let layer of data) {
		if (layer[0] != "Layer") continue;
		if (layer[1].data && layer[1].data.isGuideLayer) continue;
		processLayer(layer[1]);
	}
	let items = data[0][1].children;

	
	return _exportText;
}

const _testSettings = "-projection plan -scale [2416.0 -1364.5 2451.0 -1364.5 0.0 0.0 1.5 0.0 m]";

function processLayer(layer) {
	if (!layer.children || layer.children.length == 0) return;
	
	logText("scrap", layer.name, _testSettings);
	for (let item of layer.children) {
		switch (item[0]) {
		case "Path":
			processLine(item[1]);
			break;
		case "CompoundPath":
			processCompoundPath(item[1]);
			break;
		case "Shape":
			processShape(item[1]);
			break;
		}
	}
	logText("endscrap");
}

function processLine(item) {
	let segments = item.segments;
	if (!segments || segments.length == 0) return;
	
	let lineSettings = getSettings(item);
	let segmentOptions = lineSettings.subtypes;

	let optionsString = "";
	{
		let s = lineSettings;
		let o = [];
		o.push(s.type);
		if (s.id !== "")
			o.push("-id " + s.id);
		if (s.clip !== 0)
			o.push("-clip " + ["","on","off"][s.clip]);
		if (s.invisible === true)
			o.push("-visibility off");
		if (s.reverse === true)
			o.push("-reverse on");
		if (s.outline !== 0)
			o.push("-outline " + ["","in","out","none"][s.outline]);
		if (s.place !== 0)
			o.push("-place " + ["","bottom","default","top"][s.outline]);
		if (s.size !== undefined)
			o.push("-size " + s.size);
		if (s.otherSettings !== "")
			o.push(s.otherSettings);
		optionsString = o.join(" ");
	}

	logText("line " + optionsString); 

	if (item.closed) logText("close on");

	var firstPrinted = false;
	var prevControlPoint = "";
	var firstOutput: string;
	for (let [index, segment] of segments.entries()) {
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
	logText("endline");
}

function processCompoundPath(item) {
	for (let child of item.children)
		processLine(child);
}

function processShape(item) {
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