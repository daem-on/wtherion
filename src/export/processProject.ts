import { LayerExportResult, ProjectExportResult } from "./models";
import { processLayer } from "./processLayer";
	
export function toGlobal(global: number[], local = [0, 0]) {
	const x = Math.round((global[0]+local[0])*100)/100;
	const y = -Math.round((global[1]+local[1])*100)/100;
	return `${x} ${y}`;
}

export function processProject(data: ProjectExportResult): string[] {
	const state: string[] = [];
	state.push("encoding utf-8");

	const layers: LayerExportResult[] = (data[0][0] === "dictionary")
		? data[1] as any
		: data as any;

	const settingsLayer = layers.find(l => l[1].data?.therionData?.xthSettings);
	if (settingsLayer) {
		for (const line of settingsLayer[1].data.therionData.xthSettings) {
			state.push(line);
		}
	}
	
	for (const layer of layers) {
		if (layer[0] !== "Layer") continue;
		if (layer[1].data && (layer[1].data.isGuideLayer || layer[1].data.xviLayer)) continue;
		state.push(...processLayer(layer[1]));
	}

	return state;
}
