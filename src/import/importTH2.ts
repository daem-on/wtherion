import pg from "../init"
import LineSettings from "../objectSettings/model/LineSettings"
import getSettings from "../objectSettings/model/getSettings"
import AreaSettings from "../objectSettings/model/AreaSettings"
import PointSettings from "../objectSettings/model/PointSettings"
import { requestImportXVI } from "./importXVI"
import ScrapSettings from "../objectSettings/model/ScrapSettings"

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
		options[match[1]] = match[2];
	}
	let singleOptions = source.replace(re, "");
	let split = singleOptions.split(" ");
	for (let i = 0; i < split.length; i+=2) {
		if (split[i].trim().startsWith("-"))
			options[split[i].slice(1)] = split[i+1];
	}
	return options;
}

let _xthSettings: string[] = [];

let _linedef: boolean = false;
let _currentPath: paper.Path = null;
let _currentSegments: string[][] = null;
let _closeLine: boolean = null;
let _parsedOptions: Record<string, string> = null;
let _subtypes: Record<number, string> = {};
let _segmentOptions: Record<number, string> = {};
let _segmentIndex: number;

let _areadef: boolean = false;
let _linesWithIds: Record<string, paper.Path> = {};
let _areas: {type: string, ids: string[]}[] = [];

export default function(source: string) {
	for (let line of source.split("\n")) {
		line = line.trim();
		if (line.startsWith("#")) {
			if (line.startsWith("##XTHERION##"))
				_xthSettings.push(line);
			else continue;
		}
		if (_linedef) {
			if (isNaN(line.slice(0, 2) as any)) {
				if (line.startsWith("close")) _closeLine = true;
				else if (line.startsWith("endline")) endLine();
				else if (line.startsWith("subtype")) addSubtype(line);
				else addSegmentOption(line);
			}
			else {
				_segmentIndex++;
				addSegment(line);
			}
		} else if (_areadef) {
			if (line.startsWith("endarea")) endArea()
			else if (line.startsWith("place")
				|| line.startsWith("clip")
				|| line.startsWith("context")
				|| line.startsWith("visibility"))
				continue;
			else addLineToArea(line);
		} else {
			if (line.startsWith("line")) {
				createLine(line)
			} else if (line.startsWith("area")) {
				createArea(line);
			} else if (line.startsWith("scrap")) {
				createScrap(line);
			} else if (line.startsWith("point")) {
				createPoint(line);
			}
		}
	}
	applyAreas();
	loadImages();
	pg.layer.activateDefaultLayer();
	pg.layerPanel.updateLayerList();
	pg.undo.clear();
	pg.undo.setup();
}

function addSegment(line: string) {
	_currentSegments.push(line.split(" "));
}
				
function saveLineSettings() {
	let o = _parsedOptions;
	let s = getSettings(_currentPath) as LineSettings;
	if (o.subtype) {
		s.subtype = o.subtype; delete o.subtype;
	}
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
		_linesWithIds[o.id] = _currentPath;
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
				
	let lineSettings = getSettings(_currentPath) as LineSettings;
	lineSettings.subtypes = _subtypes;
	lineSettings.segmentSettings = _segmentOptions;
	pg.editTH2.drawLine(_currentPath);
}
				
function addSubtype(line: string) {
	_subtypes[_segmentIndex] = line.split(" ")[1];
}

function addSegmentOption(line: string) {
	if (_segmentOptions[_segmentIndex]) {
		_segmentOptions[_segmentIndex] += ";" + line;
	} else {
		_segmentOptions[_segmentIndex] = line;
	}
}
				
function createLine(line: string) {
	let split = line.split(" ");
	_currentPath = pg.editTH2.createPath();
	_currentSegments = [];
	_parsedOptions = {};
	_linedef = true;
	_closeLine = false;
	_segmentIndex = -1;
	_subtypes = {};
	_segmentOptions = {};

	let lineSettings = getSettings(_currentPath) as LineSettings;
	lineSettings.type = split[1];
					
	_parsedOptions = getOptions(line);
}

function createArea(line: string) {
	_areadef = true;
	_areas.push({
		type: line.split(" ")[1],
		ids: []
	});
}

function addLineToArea(line: string) {
	let id = line;
	_areas[_areas.length-1].ids.push(line);
}
				
function endArea() {
	_areadef = false;
}

function applyAreas() {
	for (let area of _areas) {
		if (area.ids.length > 1) {
			console.warn("This importer is designed to work with one-to-one associations between lines and areas.")
		}
		for (let id of area.ids) {
			if (id in _linesWithIds) {
				let line = _linesWithIds[id]
				
				let oldSettings = getSettings(line);
				if (oldSettings.className === "AreaSettings") {
					console.warn("Seems like one line is included in multiple areas.");
					continue;
				}
				line.data.therionData = AreaSettings.defaultSettings();
				line.data.therionData.lineSettings = oldSettings;
				line.data.therionData.type = area.type;
				pg.editTH2.drawArea(line);
			}
		}
	}
}
				
function createScrap(line: string) {
	let split = line.split(" ");
	let nl = pg.layer.addNewLayer(split[1], true);
	nl.data.therionData.createdFrom = line;

	let settings = getSettings(nl);
	let options = getOptions(split.slice(2).join(" "));

	for (let key of ScrapSettings.stringSettings) {
		if (key in options) {
			settings[key] = options[key];
			delete options[key];
		}
	}
	// TODO: if projection is [elevation ...]
	if (options.projection) {
		switch (options.projection) {
			case "none": settings.projection = 0; break;
			case "elevation": settings.projection = 2; break;
			case "extended": settings.projection = 3; break;
			default: settings.projection = 1; break;
		}
		delete options.projection;
	}

	for (const key in options) {
		if (Object.prototype.hasOwnProperty.call(options, key)) {
			settings.otherSettings += ` -${key} ${options[key]}`;
		}
	}
}
				
function createPoint(line: string) {
	let point = pg.editTH2.createPoint();
	let split = line.split(" ");
	let options = getOptions(split.slice(4).join(" "));
	options.type = split[3]
	if ("orient" in options || "orientation" in options)
		point.rotation = Number.parseFloat(options.orient || options.orientation)
	point.position = new paper.Point(toPoint(split.slice(1, 3)))
	savePointSettings(point, options);
	pg.editTH2.drawPoint(point);
}

function savePointSettings(point: paper.Shape, options: Record<string, string>) {
	let o = options;
	let s = getSettings(point) as PointSettings;

	for (let key of PointSettings.stringSettings) {
		if (key in options) {
			s[key] = o[key]; delete o[key];
		}
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
	if (o.orient) delete o.orient;
	if (o.orientation) delete o.orientation;

	for (const key in o) {
		if (Object.prototype.hasOwnProperty.call(o, key)) {
			s.otherSettings += ` -${key} ${o[key]}`;
		}
	}
}
function loadImages() {
	for (let line of _xthSettings) {
		if (line.startsWith("##XTHERION## xth_me_image_insert")) {
			let params = line.slice(33).split(" ");
			let x = Number.parseFloat(params[0].slice(1));
			let y = -Number.parseFloat(params[3].slice(1));
			let name = params[5];
			requestImportXVI(name, x, y);
		}
	}
}

