import getSettings from "../objectSettings/model/getSettings";
import ScrapSettings from "../objectSettings/model/ScrapSettings";
import { processPoint } from "./processPoint";
import { processArea } from "./processArea";
import { processLine, processCompoundPath } from "./processLine";
import { addText, addWhitespace, makeBackup, restoreBackup } from "./exportTH2";

export function processLayer(layer: paper.Layer) {
	if (!layer.children || layer.children.length == 0)
		return;

	const settings = getSettings(layer);

	let optionsString = "";
	{
		const s = settings;
		const o = [];

		for (const setting of ScrapSettings.stringSettings) {
			if (s[setting])
				o.push(`-${setting} ${s[setting]}`);
		}

		if (s.projection !== 1)
			o.push("-projection " + ["none", "plan", "elevation", "extended"][s.projection]);
		if (s.otherSettings !== "")
			o.push(s.otherSettings);
		optionsString = o.join(" ");
	}

	makeBackup();
	let exportedChildren = 0;
	addText("scrap", layer.name.replace(" ", "_"), optionsString);
	addWhitespace(1);
	for (const item of layer.children) {
		switch (item[0]) {
			case "Path":
				const s = getSettings(item[1]);
				if (s.className == "LineSettings")
					processLine(item[1]);
				else if (s.className == "AreaSettings")
					processArea(item[1]);
				exportedChildren++;
				break;
			case "CompoundPath":
				processCompoundPath(item[1]);
				exportedChildren++;
				break;
			case "Shape":
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
