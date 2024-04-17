import { processLayer } from "./processLayer";
import { LayerExportResult, ProjectExportResult } from "./models";
	
export function toGlobal(global: number[], local = [0, 0]) {
	const x = Math.round((global[0]+local[0])*100)/100;
	const y = -Math.round((global[1]+local[1])*100)/100;
	return `${x} ${y}`;
}

let exportWhitespace = 0;
let exportText = "";
export function addText(...data: any[]) {
	exportText += "\t".repeat(exportWhitespace) + data.join(" ") + "\n";
}
export function addWhitespace(amount: number) {
	exportWhitespace += amount;
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

export function processProject(data: ProjectExportResult): string {
	exportText = "";

	exportText += "encoding utf-8\n";

	const layers: LayerExportResult[] = (data[0][0] === "dictionary")
		? data[1] as any
		: data as any;

	const settingsLayer = layers.find(l => l[1].data?.therionData?.xthSettings);
	if (settingsLayer) {
		for (const line of settingsLayer[1].data.therionData.xthSettings) {
			exportText += line + "\n";
		}
	}
	
	for (const layer of layers) {
		if (layer[0] !== "Layer") continue;
		if (layer[1].data && (layer[1].data.isGuideLayer || layer[1].data.xviLayer)) continue;
		processLayer(layer[1]);
	}
		
	return exportText;
}
