import getSettings from "../objectSettings/model/getSettings";
import ScrapSettings from "../objectSettings/model/ScrapSettings";
import { processPoint } from "./processPoint";
import { processArea } from "./processArea";
import { processLine, processCompoundPath } from "./processLine";
import { addText, addWhitespace, makeBackup, restoreBackup } from "./processProject";
import { LayerExportData } from "./models";

export function processLayer(layer: LayerExportData) {
	if (!layer.children || layer.children.length === 0)
		return;

	const settings = getSettings(layer as any as paper.Layer);

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

	makeBackup();
	let exportedChildren = 0;
	addText("scrap", layer.name.replace(/ /g, "_"), optionsString);
	addWhitespace(1);
	for (const item of layer.children) {
		switch (item[0]) {
			case "Path":
				const s = getSettings(item[1] as any as paper.Path);
				if (s.className === "LineSettings")
					processLine(item[1]);
				else if (s.className === "AreaSettings")
					processArea(item[1]);
				exportedChildren++;
				break;
			case "CompoundPath":
				processCompoundPath(item[1]);
				exportedChildren++;
				break;
			case "SymbolItem":
				processPoint(item[1]);
				exportedChildren++;
				break;
		}
	}
	addWhitespace(-1);
	addText("endscrap");
	if (exportedChildren === 0)
		restoreBackup();
}
