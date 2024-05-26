import { AreaSettings, areaSettingsToString } from "../objectSettings/model/AreaSettings";
import { processLine } from "./processLine";
import { PathExportData } from "./models";
import { ExportFormatter, getSettingsInExport } from "./util";

function generateId(): string {
	return crypto.randomUUID();
}

export function processArea(item: PathExportData, format: ExportFormatter): string[] {
	const areaSettings = getSettingsInExport(item) as AreaSettings;
	const lineSettings = areaSettings.lineSettings;

	if (!lineSettings.id)
		lineSettings.id = generateId();
	const linesResult = processLine(item, format, lineSettings);
	const optionsString = areaSettingsToString(areaSettings);

	return [
		...linesResult,
		`area ${areaSettings.type} ${optionsString}`.trim(),
		`\t${lineSettings.id}`,
		"endarea"
	];
}
