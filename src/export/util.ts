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

export function getSettingsInExport<T extends ExportDataUnion>(item: T): SettingType<T> {
	return item.data.therionData as SettingType<T>;
}

export interface ExportFormatter {
	pushIndented(arr: string[], ...str: string[]): void;
	pushGroup(arr: string[], ...str: string[]): void;
	pushDivider(arr: string[], amount: number): void;
	formatNumber(num: number): string;
	skipStartCurve: boolean;
}

export const defaultExportFormatter: ExportFormatter = {
	pushIndented(arr, ...str) {
		arr.push(...str.map(line => "\t" + line));
	},
	pushGroup(arr, ...str) {
		arr.push(...str.map(line => "\t" + line));
	},
	pushDivider() {},
	formatNumber(num) {
		if (num % 1 === 0) return num.toFixed(0);
		return num.toFixed(2);
	},
	skipStartCurve: false,
};

export const xTherionFormatter: ExportFormatter = {
	pushIndented(arr, ...str) {
		arr.push(...str);
	},
	pushGroup(arr, ...str) {
		arr.push(...str.map(line => "  " + line));
	},
	pushDivider(arr, amount) {
		for (let i = 0; i < amount; i++) arr.push("");
	},
	formatNumber(num) {
		if (num % 1 === 0) return num.toFixed(1);
		return num.toFixed(2);
	},
	skipStartCurve: true,
};
