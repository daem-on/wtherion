import ScrapSettings from "../objectSettings/model/ScrapSettings";
import { processPoint } from "./processPoint";
import { processArea } from "./processArea";
import { processLine, processCompoundPath } from "./processLine";
import { LayerExportData } from "./models";
import getSettingsInExport, { pushWithWhitespace } from "./util";

export function processLayer(layer: LayerExportData): string[] {
	if (!layer.children || layer.children.length === 0)
		return [];
	
	const state: string[] = [];

	const settings = getSettingsInExport(layer);

	let optionsString = "";
	{
		const s = settings;
		const o = [];

		if (s.scale !== "") {
			const val = s.scale.includes(" ") ? `[${s.scale}]` : s.scale;
			o.push(`-scale ${val}`);
		}

		for (const setting of ScrapSettings.stringSettings.slice(1)) {
			if (s[setting])
				o.push(`-${setting} ${s[setting]}`);
		}
		
		if (s.otherSettings !== "")
			o.push(s.otherSettings.replace(/\n/g, " "));
		optionsString = o.join(" ");
	}

	let exportedChildren = 0;
	const scrapLine = `scrap ${layer.name.replace(/ /g, "_")} ${optionsString}`;
	state.push(scrapLine);
	for (const item of layer.children) {
		switch (item[0]) {
			case "Path":
				const s = getSettingsInExport(item[1]);
				if (s.className === "LineSettings")
					pushWithWhitespace(state, 1, ...processLine(item[1]));
				else if (s.className === "AreaSettings")
					pushWithWhitespace(state, 1, ...processArea(item[1]));
				exportedChildren++;
				break;
			case "CompoundPath":
				pushWithWhitespace(state, 1, ...processCompoundPath(item[1]));
				exportedChildren++;
				break;
			case "SymbolItem":
				pushWithWhitespace(state, 1, processPoint(item[1]));
				exportedChildren++;
				break;
		}
	}
	state.push("endscrap");
	if (exportedChildren === 0)
		return [];

	return state;
}
