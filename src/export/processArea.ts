import AreaSettings from "../objectSettings/model/AreaSettings";
import { processLine } from "./processLine";
import { PathExportData } from "./models";
import getSettingsInExport from "./util";

function generateId(): string {
	return new Crypto().randomUUID();
}

export function processArea(item: PathExportData): string[] {
	const areaSettings = getSettingsInExport(item) as AreaSettings;
	const lineSettings = areaSettings.lineSettings;

	if (lineSettings.id === "")
		lineSettings.id = generateId();
	processLine(item, lineSettings);

	return [
		`area ${areaSettings.type}`,
		`\t${lineSettings.id}`,
		"endarea"
	];
}
