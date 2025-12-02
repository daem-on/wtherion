import { importAndAddImage } from "../import";
import { activateDefaultLayer, addNewLayer } from "../layer";
import paper from "paper";

const COMMMON_COLOR = new paper.Color(0.2, 0.2, 0.2);
const COMMMON_FILL = new paper.Color(0.2, 0.2, 0.2, 0.1);

enum ProcessingState {
	Default,
	XVIStations,
	XVIShots,
	XVISketchlines
}
let state: ProcessingState = 0;

function createLayer(name?: string): paper.Layer {
	const l = addNewLayer(name ?? "therion.xviLayer");
	l.data.xviLayer = true;
	return l;
}

export type PositionList = [name: string, x: number, y: number][];

export function importFiles(files: { file: File, name: string, x: number, y: number }[]): void {
	for	(const file of files) {
		if (file.name.endsWith(".xvi")) {
			const reader = new FileReader();
			reader.readAsText(file.file);
			reader.onload = () => {
				const position = new paper.Point(file.x, file.y);
				importXVI(reader.result as string, file.name, position);
			};
		} else {
			const reader = new FileReader();
			reader.readAsDataURL(file.file);
			reader.onload = () => {
				importAndAddImage(reader.result);
			};
		}
	}
}

export function importXVI(source: string, name?: string, moveTo?: paper.Point) {
	const layer = createLayer(name);
	let firstStation: [string, string] = null;

	for (let line of source.split("\n")) {
		line = line.trim();
		if (state === ProcessingState.Default) {
			if (line.startsWith("set XVIstations")) state = ProcessingState.XVIStations;
			if (line.startsWith("set XVIshots")) state = ProcessingState.XVIShots;
			if (line.startsWith("set XVIsketchlines")) state = ProcessingState.XVISketchlines;
		} else {
			if (line.startsWith("}")) {state = ProcessingState.Default; continue;}
			switch (state) {
			case ProcessingState.XVIStations:
				const [x, y, n] = line.slice(1, line.length-1).split(" ").filter(i => i);
				createStation(x, y, n);
				if (firstStation == null) firstStation = [x, y];
				break;
			case ProcessingState.XVIShots:
				const entries = line.slice(1, line.length-1).split(" ").filter(i => i);
				if (entries.length === 4) {
					const [x1, y1, x2, y2] = entries;
					createShot(x1, y1, x2, y2);
				} else {
					const [x1, y1, x2, y2] = entries.slice(0, 4);
					createShot(x1, y1, x2, y2);
					createAreaShot(entries.slice(4));
				}
				break;
			case ProcessingState.XVISketchlines:
				const list = line.slice(1, line.length-1).split(" ");
				createSketchLine(list[0], list.slice(1));
				break;
			}
		}
	}
	new paper.Group([...layer.children]);
	if (moveTo != null && firstStation != null) {
		const [x, y] = firstStation;
		const point = new paper.Point(Number.parseFloat(x), -Number.parseFloat(y));
		layer.translate(moveTo.subtract(point));
	}
	layer.sendToBack();
	activateDefaultLayer();
}

function createStation(x: string, y: string, n: string) {
	const circle = new paper.Shape.Circle({
		center: new paper.Point(
			Number.parseFloat(x),
			-Number.parseFloat(y)
		),
		radius: 2,
		fillColor: COMMMON_COLOR,
	});
	circle.data.noDrawHandle = true;
	circle.data.therionData = {
		className: "XVIStation",
		name: n
	};
}

function createShot(x1: string, y1: string, x2: string, y2: string) {
	new paper.Path({
		segments: [
			[Number.parseFloat(x1), -Number.parseFloat(y1)],
			[Number.parseFloat(x2), -Number.parseFloat(y2)]
		],
		strokeWidth: 1,
		strokeColor: COMMMON_COLOR
	});
}

function createAreaShot(list: string[]) {
	const segments: [number, number][] = [];
	for (let i = 0; i < list.length; i += 2) {
		segments.push([
			Number.parseFloat(list[i]),
			-Number.parseFloat(list[i+1])
		]);
	}

	new paper.Path({
		fillColor: COMMMON_FILL,
		segments: segments,
		closed: true
	});
}

function createSketchLine(color: string, positions: string[]) {
	positions = positions.filter(p => p !== "");
	const segments: [number, number][] = [];
	for (let i = 0; i < positions.length; i += 2) {
		segments.push([
			Number.parseFloat(positions[i]),
			-Number.parseFloat(positions[i+1])
		]);
	}

	const path = new paper.Path({
		strokeColor: color,
		segments: segments
	});
}