import ScrapSettings from "../objectSettings/model/ScrapSettings";
import { processPoint } from "./processPoint";
import { processArea } from "./processArea";
import { processLine, processCompoundPath } from "./processLine";
import { LayerExportData } from "./models";
import { getSettingsInExport, ExportFormatter } from "./util";

function wrapIfNeeded(value: string, brackets: boolean): string {
	if (!value.includes(" ")) return value;
	if (brackets) return `[${value}]`;
	return `"${value}"`;
}

export function processLayer(layer: LayerExportData, format: ExportFormatter): string[] {
	if (!layer.children || layer.children.length === 0)
		return [];
	
	const state: string[] = [];

	const settings = getSettingsInExport(layer);

	let optionsString = "";
	{
		const s = settings;
		const o = [];

		for (const setting of ScrapSettings.bracketSettings) {
			if (s[setting])
				o.push(`-${setting} ${wrapIfNeeded(s[setting], true)}`);
		}
		for (const setting of ScrapSettings.rawStringeSettings) {
			if (s[setting])
				o.push(`-${setting} ${s[setting]}`);
		}
		
		if (s.stationNames !== "")
			o.push(`-station-names ${s.stationNames}`);

		if (s.otherSettings !== "")
			o.push(s.otherSettings.replace(/\n/g, " "));
		optionsString = o.join(" ");
	}

	const scrapLine = `scrap ${layer.name.replace(/ /g, "_")} ${optionsString}`;
	state.push(scrapLine);

	for (const item of layer.children) {
		switch (item[0]) {
			case "Path":
				const s = getSettingsInExport(item[1]);
				if (s.className === "LineSettings") {
					format.pushDivider(state, 1);
					format.pushIndented(state, ...processLine(item[1], format));
				} else if (s.className === "AreaSettings") {
					format.pushDivider(state, 1);
					format.pushIndented(state, ...processArea(item[1], format));
				}
				break;
			case "CompoundPath":
				format.pushDivider(state, 1);
				format.pushIndented(state, ...processCompoundPath(item[1], format));
				break;
			case "SymbolItem":
				format.pushDivider(state, 1);
				format.pushIndented(state, processPoint(item[1], format));
				break;
		}
	}

	if (state.length === 1) return [];
	format.pushDivider(state, 1);
	state.push("endscrap");

	return state;
}
