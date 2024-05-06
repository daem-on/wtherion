import { pointSettingsToString } from "../objectSettings/model/PointSettings";
import { Matrix, SymbolItemExportData } from "./models";
import { toGlobal } from "./processProject";
import { ExportFormatter, getSettingsInExport } from "./util";

function matrixToRotation(matrix: Matrix): number {
	let angle = Math.atan2(matrix[1], matrix[0]);
	angle = angle * 180 / Math.PI;
	if (angle < 0) angle += 360;
	return angle;
}

export function processPoint(item: SymbolItemExportData, format: ExportFormatter): string {
	const shape = item;
	const settings = getSettingsInExport(item);
	const position = toGlobal(shape.matrix.slice(4, 6), [0, 0], format);
	let options = "";
	options += settings.type;

	const rotation = matrixToRotation(shape.matrix);
	if (rotation !== 0) options += ` -orientation ${rotation}`;

	const result = pointSettingsToString(settings);
	if (result !== "") options += ` ${result}`;

	return `point ${position} ${options}`;
}
