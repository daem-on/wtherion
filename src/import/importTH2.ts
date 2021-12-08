import pg from "../init"
import { getSettings } from "../objectSettings/LineSettings"
				
const toPoint = function(global: string[], global2: string[] = undefined) {
	if (global2)
	return new paper.Point([
		-(Number.parseFloat(global2[0])-Number.parseFloat(global[0])),
		+(Number.parseFloat(global2[1])-Number.parseFloat(global[1]))
	])
	else return new paper.Point([
		Number.parseFloat(global[0]),
		-Number.parseFloat(global[1])
	])
}
				
const getOptions = function(source: string) {
	let options: Record<string, string> = {};
				
	let re = /-([a-z]+) ['"\[]([^'"\[\]]+)['"\]]/g;
	let matches = source.matchAll(re);
	for (let match of matches) {
		options[match[1].toLowerCase()] = match[2].toLowerCase();
	}
	let singleOptions = source.replace(re, "");
	let split = singleOptions.split(" ");
	for (let i = 0; i < split.length; i+=2) {
		if (split[i].trim().startsWith("-"))
			options[split[i].slice(1).toLowerCase()] = split[i+1].toLowerCase();
	}
	return options;
}
				
let _linedef: boolean =  false;
let _currentPath: paper.Path =  null;
let _currentSegments: string[][] =  null;
let _closeLine: boolean =  null;
let _lineCommands: string[] =  ["reverse", "close"];
let _parsedOptions: Record<string, string> = null;
let _subtypes: Record<number, string> = {};
let _segmentIndex: number;
				
export default function(source: string) {
	for (let line of source.split("\n")) {
		line = line.trim();
		if (line.startsWith("#")) continue;
		if (_linedef === true) {
			if (isNaN(line.slice(0, 2) as any)) {
				if (line.startsWith("close")) _closeLine = true;
				if (line.startsWith("endline")) endLine();
				if (line.startsWith("subtype")) addSubtype(line);
			}
			else {
				_segmentIndex++;
				addSegment(line);
			}
		} else {
			if (line.startsWith("line")) {
				createLine(line)
			} else if (line.startsWith("scrap")) {
				createScrap(line);
			} else if (line.startsWith("point")) {
				createPoint(line);
			}
		}
	}
	pg.layerPanel.updateLayerList();
}
				
function addSegment(line: string) {
	_currentSegments.push(line.split(" "));
}
				
function saveLineSettings() {
	let o = _parsedOptions;
	let s = getSettings(_currentPath);
	if (o.subtype) {};
	if (o.close === "on") {
		_closeLine = true; delete o.close;
	}
	if (o.reverse === "on") {
		s.reverse = true; delete o.reverse;
	}
	if (o.place) {
		if (o.place === "bottom") s.place = 1;
		if (o.place === "top") s.place = 2;
		delete o.place;
	}
	if (o.clip) {
		if (o.clip === "on") s.clip = 1;
		if (o.clip === "off") s.clip = 2;
		delete o.clip;
	}
	if (o.visibility === "off") {
		s.invisible = true; delete o.visibility;
	}
	if (o.outline) {
		if (o.outline === "in") s.outline = 1;
		if (o.outline === "out") s.outline = 2;
		if (o.outline === "none") s.outline = 3;
		delete o.outline;
	}
	if (o.id) {
		s.id = o.id; delete o.id;
	}
				
	for (const key in o) {
		if (Object.prototype.hasOwnProperty.call(o, key)) {
			s.otherSettings += ` -${key}  ${o[key]}`;
		}
	}
}
				
function endLine() {
	let segments = _currentSegments;
	let lastpoint: string[];
	for (let i = 0; i < segments.length; i++) {
		let segment = segments[i];
		if (segment.length == 2) {
			_currentPath.add(new paper.Point(toPoint(segment)));
			lastpoint = segment;
		} else if (segment.length == 6) {
			_currentPath.lastSegment.handleOut =
				toPoint(segment.slice(0, 2), lastpoint);
			_currentPath.add(new paper.Segment(
				toPoint(segment.slice(4, 6)),
				toPoint(segment.slice(2, 4), segment.slice(4, 6)),
				new paper.Point([0, 0])
			));
			lastpoint = segment.slice(4, 6);
		}
	}
				
	saveLineSettings();
				
	if (_closeLine) _currentPath.closed = true;
	_linedef = false;
				
	let lineSettings = getSettings(_currentPath);
	lineSettings.subtypes = _subtypes;
}
				
function addSubtype(line: string) {
	_subtypes[_segmentIndex] = line.split(" ")[1];
}
				
function createLine(line: string) {
	let split = line.split(" ");
	_currentPath = pg.editTH2.createPath();
	_currentPath.strokeColor = new paper.Color("black");
	_currentSegments = [];
	_parsedOptions = {};
	_linedef = true;
	_closeLine = false;
	_segmentIndex = 0;
	_subtypes = [];
				
	let lineSettings = getSettings(_currentPath);
	lineSettings.type = split[1];
					
	_parsedOptions = getOptions(line);
}
				
function createScrap(line: string) {
	let split = line.split(" ");
	let nl = pg.layer.addNewLayer(split[1], true);
	nl.data.therionData = {
		createdFrom: line,
	};
}
				
function createPoint(line: string) {
	let point = pg.editTH2.createPoint();
	let split = line.split(" ");
	point.position = new paper.Point(toPoint(split.slice(1, 3)))
	const index = split.findIndex(s => s=="-orient" || s=="-orientation");
	if (index !== -1)
		point.rotation = Number.parseFloat(split[index+1]);
}