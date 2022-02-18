import paper from "paper";
import { Place } from "../objectSettings/model/LineSettings";
import { saveAs } from "file-saver";
import { processLayer } from "./processLayer";
	
export function toGlobal(global: number[], local = [0, 0]) {
	let x = Math.round((global[0]+local[0])*100)/100;
	let y = -Math.round((global[1]+local[1])*100)/100;
	return `${x} ${y}`
}

let exportWhitespace = 0;
let exportText = ""
export function addText(...data: any[]) {
	exportText += "\t".repeat(exportWhitespace) + data.join(" ") + "\n";
}
export function addWhitespace(amount: number) {
	exportWhitespace += amount
}
let backupText: string = null;
export function makeBackup() {
	backupText = exportText;
}
export function restoreBackup() {
	if (!backupText) return;
	exportText = backupText;
	backupText = null;
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
	exportText = ""
	
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
		
	return exportText;
}
