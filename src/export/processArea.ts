import getSettings from "../objectSettings/model/getSettings";
import AreaSettings from "../objectSettings/model/AreaSettings";
import { addText, addWhitespace } from "./exportTH2";
import { processLine, paperExportedPath } from "./processLine";

function generateId() {
	return Math.round(Math.random() * 10000).toString();
}

export function processArea(item: paperExportedPath) {
	const areaSettings = getSettings(item as any) as AreaSettings;
	const lineSettings = areaSettings.lineSettings;

	if (lineSettings.id === "")
		lineSettings.id = generateId();
	processLine(item, lineSettings);

	addText(`area ${areaSettings.type}`);
	addWhitespace(1);
	addText(lineSettings.id);
	addWhitespace(-1)
	addText("endarea");
}
