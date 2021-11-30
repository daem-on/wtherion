import pg from "./init"

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
	let options = {};

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

let _linedef: boolean =  false;
let _currentPath: paper.Path =  null;
let _currentSegments: string[][] =  null;
let _closeLine: boolean =  null;
let _lineCommands: string[] =  ["reverse", "close"];

export default function(source: string) {
	for (let line of source.split("\n")) {
		line = line.trim();
		if (line.startsWith("#")) continue;
		if (_linedef === true) {
			if (isNaN(line.slice(0, 2) as any)) {
				if (line.startsWith("close")) _closeLine = true;
				if (line.startsWith("endline")) endLine();
			}
			else addSegment(line);
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

function endLine() {
	let segments = _currentSegments;
	let lastpoint: string[];
	for (let i = 0; i < segments.length; i++) {
		let segment = segments[i];
		if (segment.length == 2) {
			_currentPath.add(new paper.Point(
				toPoint(segment)
			));
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
	if (_closeLine) _currentPath.closed = true;
	_linedef = false;
}

function createLine(line: string) {
	let split = line.split(" ");
	_currentPath = pg.editTH2.newPath();
	_currentPath.strokeColor = new paper.Color("black");
	_currentSegments = [];
	_linedef = true;
	_closeLine = false;
	_currentPath.data
	_currentPath.data.therionData.type = split[1];
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