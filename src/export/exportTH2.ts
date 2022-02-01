import paper from "paper";
import LineSettings, { Place } from "../objectSettings/model/LineSettings";
import getSettings from "../objectSettings/model/getSettings";
import AreaSettings from "../objectSettings/model/AreaSettings";
import { saveAs } from "file-saver";
import PointSettings from "../objectSettings/model/PointSettings";
import ScrapSettings from "../objectSettings/model/ScrapSettings";
	
function toGlobal(global: number[], local = [0, 0]) {
	let x = Math.round((global[0]+local[0])*100)/100;
	let y = -Math.round((global[1]+local[1])*100)/100;
	return `${x} ${y}`
}

let _exportWhitespace = 0;
let _exportText = ""
function logText(...data: any[]) {
	_exportText += "\t".repeat(_exportWhitespace) + data.join(" ") + "\n";
}

export function runWorker() {
	let worker = new Worker(new URL('./worker', import.meta.url));
	worker.postMessage({question: "asdfasd"});
	worker.onmessage = data => {console.log(data)}
}
	
export function asBlob() {
	return new Blob([run()], {type: "text/th2"});
}

export function save() {
	saveAs(asBlob(), "export.th2");
}
	
function run() {
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
	
function processLayer(layer: paper.Layer) {
	if (!layer.children || layer.children.length == 0) return;

	let settings = getSettings(layer);

	let optionsString = "";
	{
		let s = settings;
		let o = [];
		if (s.projection !== 1)
			o.push("-projection " + ["none","plan","elevation","extended"][s.projection]);
		if (s.scale !== "")
			o.push("-scale " + s.scale);
		if (s.author !== "")
			o.push("-author " + s.author);
		if (s.copyright !== "")
			o.push("-copyright " + s.copyright);
		if (s.otherSettings !== "")
			o.push(s.otherSettings);
		optionsString = o.join(" ");
	}

	let backupText = _exportText;
	let exportedChildren = 0;
	logText("scrap", layer.name.replace(" ", "_"), optionsString);
	_exportWhitespace++;
	for (let item of layer.children) {
		switch (item[0]) {
		case "Path":
			let s = getSettings(item[1]);
			if (s.className == "LineSettings")
				processLine(item[1]);
			else if (s.className == "AreaSettings")
				processArea(item[1]);
			exportedChildren++;
			break;
		case "CompoundPath":
			processCompoundPath(item[1]);
			exportedChildren++;
			break;
		case "Shape":
			processShape(item[1]);
			exportedChildren++;
			break;
		}
	}
	_exportWhitespace--;
	logText("endscrap");
	if (exportedChildren === 0) _exportText = backupText;
}
	
type paperExportedPath = {
	closed: boolean,
	segments: segment[],
	data: { therionData: {}; };
}

type cornerSegment = [x: number, y: number]
type curvedSegment = [center: number[], handleIn: number[], handleOut: number[]]
type segment = cornerSegment | curvedSegment;
function isCurved(segment: segment): segment is curvedSegment {
	return segment.length >= 3;
}

function processLine(item: paperExportedPath, settings?: LineSettings) {
	let segments = item.segments;
	if (!segments || segments.length < 2) return;
		
	let lineSettings = settings || getSettings(item as any) as LineSettings;
	let subtypes = lineSettings.subtypes;
	let segmentSettings = lineSettings.segmentSettings;
	
	let optionsString = "";
	{
		let s = lineSettings;
		let o = [];
		o.push(s.type);
		if (s.id !== "")
			o.push("-id " + s.id);
		if (s.subtype !== "")
			o.push("-subtype " + s.subtype);
		if (s.clip !== 0)
			o.push("-clip " + ["","on","off"][s.clip]);
		if (s.invisible === true)
			o.push("-visibility off");
		if (s.reverse === true)
			o.push("-reverse on");
		if (s.outline !== 0)
			o.push("-outline " + ["","in","out","none"][s.outline]);
		if (s.place !== 0)
			o.push("-place " + ["","bottom","top"][s.place]);
		// // not sure what's up with this, apparently can't be set here
		// if (s.size !== undefined && s.size !== 0)
		// 	o.push("-size " + s.size);
		if (s.otherSettings !== "")
			o.push(s.otherSettings);
		optionsString = o.join(" ");
	}
	
	logText("line " + optionsString); 
	_exportWhitespace++;
	
	if (item.closed) logText("close on");

	for (let i = 0; i < segments.length + (item.closed?1:0); i++) {
		let output = [];
		const current = segments.at(i%segments.length);
		const last = segments.at(i-1);

		if (isCurved(last)) {
			if (isCurved(current))		output.push(toGlobal(last[0], last[2]), toGlobal(current[0], current[1]));
			else 						output.push(toGlobal(last[0], last[2]), toGlobal(current));
		} else if (isCurved(current))	output.push(toGlobal(last), toGlobal(current[0], current[1]));

		output.push(isCurved(current) ? toGlobal(current[0]) : toGlobal(current));

		logText(output.join(" "));
		if (i in subtypes) {
			logText("subtype " + subtypes[i]);
		}
		if (i in segmentSettings) {
			logText(segmentSettings[i].replace(";", "\n"));
		}
	}

	if (lineSettings.size !== undefined
		&& lineSettings.size !== 0) logText("size " + lineSettings.size);
	_exportWhitespace--;
	logText("endline");
}

function processCompoundPath(item) {
	for (let child of item.children)
		processLine(child);
}
	
function processShape(item) {
	let shape = item;
	let settings = getSettings(item) as PointSettings;
	let position = toGlobal(shape.matrix.slice(4, 6));
	let options = "";
	{
		options += settings.type;
	
		const s = settings;
		if (s.invisible) options += " -visibility off";
		if (s.name) options += " -name " + s.name;
		if (s.clip !== 0)
			options += " -clip " + ["","on","off"][s.clip];
		if (s.place !== 0)
			options += " -place " + ["","bottom","top"][s.place];
		if (s.id) options += " -id " + s.id;
		if (s.scale !== "m") options += " -scale " + s.scale;
		if (s.text) options += " -text " + s.text;
		if (s.value) options += " -value " + s.value;
		if (s.rotation !== 0) options += " -orientation " + s.rotation;
		if (s.otherSettings) options += " " + s.otherSettings;
	}

	logText("point", position, options);
}
	
function generateId() {
	return Math.round(Math.random()*10000).toString();
}
	
function processArea(item: paperExportedPath) {
	let areaSettings = getSettings(item as any) as AreaSettings;
	let lineSettings = areaSettings.lineSettings;
	
	if (lineSettings.id === "") lineSettings.id = generateId()
	processLine(item, lineSettings);
	
	logText(`area ${areaSettings.type}`);
	_exportWhitespace++;
	logText(lineSettings.id);
	_exportWhitespace--;
	logText("endarea");
}
