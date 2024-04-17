import getSettings from "../objectSettings/model/getSettings";
import AreaSettings from "../objectSettings/model/AreaSettings";
import { addText, addWhitespace } from "./processProject";
import { processLine } from "./processLine";
import { PathExportData } from "./models";

function generateId() {
	return Math.round(Math.random() * 10000).toString();
}

export function processArea(item: PathExportData) {
	const areaSettings = getSettings(item as any) as AreaSettings;
	const lineSettings = areaSettings.lineSettings;

	if (lineSettings.id === "")
		lineSettings.id = generateId();
	processLine(item, lineSettings);

	addText(`area ${areaSettings.type}`);
	addWhitespace(1);
	addText(lineSettings.id);
	addWhitespace(-1);
	addText("endarea");
}
