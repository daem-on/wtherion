import { LayerExportResult, ProjectExportResult } from "./models";
import { processLayer } from "./processLayer";
import { defaultExportFormatter, ExportFormatter } from "./util";
	
export function toGlobal(global: number[], local: number[], format: ExportFormatter) {
	const x = format.formatNumber((global[0]+local[0]));
	const y = format.formatNumber(-(global[1]+local[1]));
	return `${x} ${y}`;
}

export function processProject(data: ProjectExportResult, format: ExportFormatter = defaultExportFormatter): string[] {
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
		state.push(...processLayer(layer[1], format));
		format.pushDivider(state, 3);
	}

	return state;
}
