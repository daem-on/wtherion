import getSettings from "../objectSettings/model/getSettings";
import PointSettings from "../objectSettings/model/PointSettings";
import { SymbolItemExportData } from "./models";
import { toGlobal, addText } from "./processProject";
import { Matrix } from "paper";

export function processPoint(item: SymbolItemExportData) {
	const shape = item;
	const settings = getSettings(item as any as paper.SymbolItem);
	const position = toGlobal(shape.matrix.slice(4, 6));
	let options = "";
	options += settings.type;

	const matrix = new Matrix(shape.matrix);
	let rotation = matrix.rotation % 360;
	if (rotation < 0) rotation += 360;

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

	addText("point", position, options);
}
