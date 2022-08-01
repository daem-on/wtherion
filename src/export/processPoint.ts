import getSettings from "../objectSettings/model/getSettings";
import PointSettings from "../objectSettings/model/PointSettings";
import { toGlobal, addText } from "./exportTH2";

export function processPoint(item: any) {
	const shape = item;
	const settings = getSettings(item) as PointSettings;
	const position = toGlobal(shape.matrix.slice(4, 6));
	let options = "";
	options += settings.type;

	{
		const s = settings;
		for (const setting of PointSettings.stringSettings.slice(2)) {
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
		if (s.rotation !== 0)
			options += " -orientation " + s.rotation;
		if (s.otherSettings)
			options += " " + s.otherSettings.replace(/\n/g, " ");
	}

	addText("point", position, options);
}
