import AreaSettings from "../objectSettings/model/AreaSettings";
import LineSettings from "../objectSettings/model/LineSettings";
import PointSettings from "../objectSettings/model/PointSettings";
import ScrapSettings from "../objectSettings/model/ScrapSettings";
import { LayerExportData, PathExportData, SymbolItemExportData } from "./models";

type SettingType<T> = 
	T extends PathExportData ? (LineSettings | AreaSettings) :
	T extends SymbolItemExportData ? PointSettings :
	T extends LayerExportData ? ScrapSettings :
	never;

type ExportDataUnion = PathExportData | SymbolItemExportData | LayerExportData;

export default function getSettingsInExport<T extends ExportDataUnion>(item: T): SettingType<T> {
	return item.data.therionData as SettingType<T>;
}

const WHITESPACE = "\t";

export function pushWithWhitespace(arr: string[], amount: number, ...str: string[]) {
	if (amount === 0)
		arr.push(...str);
	else
		arr.push(...str.map(line => WHITESPACE.repeat(amount) + line));
}
