import paper from "paper";
import AreaSettings from "./objectSettings/model/AreaSettings";
import getSettings from "./objectSettings/model/getSettings";
import LineSettings from "./objectSettings/model/LineSettings";
import PointSettings from "./objectSettings/model/PointSettings";
import ScrapSettings from "./objectSettings/model/ScrapSettings";

function isExportableChild(item: paper.Item) {
	return item.className == "Path"
	|| item.className == "Shape"
	|| item.className == "CompoundPath";
}

type AnySettings = AreaSettings | LineSettings | PointSettings | ScrapSettings;

class ValidationError extends Error {
	constructor(message: string, public settings: AnySettings) {
		super(message);
	}
}

export function assertValid(value: boolean, message: string, settings: AnySettings) {
	if (!value) throw new ValidationError(message, settings);
}

export function validateProject() {
	const project = paper.project;

	for (const layer of project.layers) {
		if (layer.isEmpty) continue;
		if (!layer.children.some(isExportableChild)) continue;
		ScrapSettings.validate(getSettings(layer));
		for (const item of layer.children) {
			if (isExportableChild(item)) {
				const itemSettings = getSettings(item as any);
				if (itemSettings == null) continue;
				switch (itemSettings.className) {
					case "LineSettings":
						LineSettings.validate(itemSettings);
						break;
					case "PointSettings":
						PointSettings.validate(itemSettings);
						break;
					case "AreaSettings":
						AreaSettings.validate(itemSettings);
						break;
				}
			}
		}
	}
}