import pg from "../init";
const COMMMON_COLOR = new paper.Color(0.2, 0.2, 0.2);

enum ProcessingState {
	Default,
	XVIStations,
	XVIShots,
	XVISketchlines
}
let state: ProcessingState = 0;

function createLayer(name?: string): paper.Layer {
	const l = pg.layer.addNewLayer(name ?? "therion.xviLayer");
	// l.locked = true;
	l.data.isGuideLayer = true;
	l.data.xviLayer = true;
	return l;
}

export function importFiles(list: File[]): void {
	for	(const file of list) {
		if (file.name.endsWith(".xvi")) {
			const reader = new FileReader();
			reader.readAsText(file);
			reader.onload = function () {
				importXVI(reader.result as string, file.name);
			};
		} else {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function () {
				pg.import.importAndAddImage(reader.result);
			};
		}
	}
}

export function importXVI(source: string, name?: string, existingLayer?: paper.Layer) {
	const layer = existingLayer ?? createLayer(name);

	for (let line of source.split("\n")) {
		line = line.trim();
		if (state === ProcessingState.Default) {
			if (line.startsWith("set XVIstations")) state = ProcessingState.XVIStations;
			if (line.startsWith("set XVIshots")) state = ProcessingState.XVIShots;
			if (line.startsWith("set XVIsketchlines")) state = ProcessingState.XVISketchlines;
		} else if (state === ProcessingState.XVIStations) {
			if (line.startsWith("}")) {state = ProcessingState.Default; continue;}

			const [x, y, n] = line.slice(1, line.length-1).split(" ").filter(i => i);
			createStation(x, y, n);
		} else if (state === ProcessingState.XVIShots) {
			if (line.startsWith("}")) {state = ProcessingState.Default; continue;}

			const [x1, y1, x2, y2] = line.slice(1, line.length-1).split(" ").filter(i => i);
			createShot(x1, y1, x2, y2);
		} else if (state === ProcessingState.XVISketchlines) {
			if (line.startsWith("}")) {state = ProcessingState.Default; continue;}

			const list = line.slice(1, line.length-1).split(" ");
			createSketchLine(list[0], list.slice(1));
		}
	}
	new paper.Group([...layer.children]);
	pg.layerPanel.updateLayerList();
	if (layer.data.moveTo) layer.translate(
		new paper.Point(layer.data.moveTo[0], layer.data.moveTo[1])
	);
	layer.sendToBack();
	pg.layer.activateDefaultLayer();
}

function createStation(x: string, y: string, n: string) {
	const circle = new paper.Shape.Circle({
		center: new paper.Point(
			Number.parseFloat(x),
			-Number.parseFloat(y)
		),
		radius: 5,
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
		strokeColor: COMMMON_COLOR
	});
}

function createSketchLine(color: string, positions: string[]) {
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