import pg from "../init";
const COMMMON_COLOR = new paper.Color(0.2, 0.2, 0.2);

enum ProcessingState {
	Default,
	XVIstations,
	XVIShots
}
let state: ProcessingState = 0;

function createLayer(name?: string): paper.Layer {
	const l = pg.layer.addNewLayer(name ?? "therion.xviLayer");
	// l.locked = true;
	l.data.isGuideLayer = true;
	l.data.xviLayer = true;
	return l;
}

export function requestImportXVI(filename: string, x: number, y: number) {
	const input = document.createElement("input");
	input.type = "file";
	const layer = createLayer();
	layer.data.moveTo = [x, y];
	input.onchange = fileProcessor(layer);
	input.accept = ".xvi";
	input.click();
}

function fileProcessor(layer: paper.Layer): (event) => void {
	return (event) => {
		const reader = new FileReader();
		reader.readAsText(event.target.files[0]);
		reader.onload = function () {
			importXVI(reader.result as string, event.target.files[0].name, layer);
		};
	};
}

export function importXVI(source: string, name?: string, existingLayer?: paper.Layer) {
	const layer = existingLayer ?? createLayer(name);

	for (let line of source.split("\n")) {
		line = line.trim();
		if (state === 0) {
			if (line.startsWith("set XVIstations")) state = 1;
			if (line.startsWith("set XVIshots")) state = 2;
		} else if (state === 1) {
			if (line.startsWith("}")) {state = 0; continue;}

			const [x, y, n] = line.slice(1, line.length-1).split(" ").filter(i => i);
			createStation(x, y, n);
		} else if (state === 2) {
			if (line.startsWith("}")) {state = 0; continue;}

			const [x1, y1, x2, y2] = line.slice(1, line.length-1).split(" ").filter(i => i);
			createShot(x1, y1, x2, y2);
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