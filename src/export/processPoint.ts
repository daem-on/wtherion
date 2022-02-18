import getSettings from "../objectSettings/model/getSettings";
import PointSettings from "../objectSettings/model/PointSettings";
import { toGlobal, addText } from "./exportTH2";

export function processPoint(item: any) {
	let shape = item;
	let settings = getSettings(item) as PointSettings;
	let position = toGlobal(shape.matrix.slice(4, 6));
	let options = "";
	options += settings.type;

	{
		const s = settings;
		for (let setting of PointSettings.stringSettings.slice(2)) {
			if (s[setting])
				options += ` -${setting} ${s[setting]}`;
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
			options += " " + s.otherSettings;
	}

	addText("point", position, options);
}
