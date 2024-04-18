import PointSettings from "../objectSettings/model/PointSettings";
import { Matrix, SymbolItemExportData } from "./models";
import { toGlobal } from "./processProject";
import getSettingsInExport from "./util";

function matrixToRotation(matrix: Matrix): number {
	let angle = Math.atan2(matrix[1], matrix[0]);
	angle = angle * 180 / Math.PI;
	if (angle < 0) angle += 360;
	return angle;
}

export function processPoint(item: SymbolItemExportData): string {
	const shape = item;
	const settings = getSettingsInExport(item);
	const position = toGlobal(shape.matrix.slice(4, 6));
	let options = "";
	options += settings.type;

	const rotation = matrixToRotation(shape.matrix);

	{
		const s = settings;
		for (const setting of PointSettings.exportStringSettings) {
			if (s[setting]) {
				let out: string = s[setting];
				if (out.includes(" ")) out = `"${out}"`;
				options += ` -${setting} ${out}`;
			}
		}

		if (s.invisible)
			options += " -visibility off";
		if (s.clip !== 0)
			options += " -clip " + ["", "on", "off"][s.clip];
		if (s.place !== 0)
			options += " -place " + ["", "bottom", "top"][s.place];
		if (s.scale !== "m")
			options += " -scale " + s.scale;
		if (rotation !== 0)
			options += " -orientation " + rotation;
		if (s.otherSettings)
			options += " " + s.otherSettings.replace(/\n/g, " ");
	}

	return `point ${position} ${options}`;
}
