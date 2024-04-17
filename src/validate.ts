import paper from "paper";
import AreaSettings from "./objectSettings/model/AreaSettings";
import getSettings from "./objectSettings/model/getSettings";
import LineSettings from "./objectSettings/model/LineSettings";
import PointSettings from "./objectSettings/model/PointSettings";
import ScrapSettings from "./objectSettings/model/ScrapSettings";
import { addDialog } from "./modal";
import ValidationDialog from "./components/dialogs/ValidationDialog.vue";

function isExportableChild(item: paper.Item) {
	return item.className === "Path"
	|| item.className === "SymbolItem"
	|| item.className === "CompoundPath";
}

type AnySettings = AreaSettings | LineSettings | PointSettings | ScrapSettings;

class ValidationError extends Error {
	constructor(message: string, public settings: AnySettings) {
		super(message);
	}
}

export type AssertFunction = (value: boolean, message: string, settings: AnySettings) => void;

export function assertValid(value: boolean, message: string, settings: AnySettings) {
	if (!value) throw new ValidationError(message, settings);
}

export type ValidationResult = Iterable<[ValidationError, paper.Item]>;

function* validateProject(): ValidationResult {
	const project = paper.project;

	for (const layer of project.layers) {
		if (layer.isEmpty()) continue;
		if (!layer.children.some(isExportableChild)) continue;

		try {
			ScrapSettings.validate(getSettings(layer), assertValid);
		} catch (e) {
			if (e instanceof ValidationError) yield [e, layer];
			else throw e;
		}
		
		for (const item of layer.children) {
			if (isExportableChild(item)) {
				const itemSettings = getSettings(item as any);
				if (itemSettings == null) continue;

				try {
					switch (itemSettings.className) {
						case "LineSettings":
							LineSettings.validate(itemSettings, assertValid);
							break;
						case "PointSettings":
							PointSettings.validate(itemSettings, assertValid);
							break;
						case "AreaSettings":
							AreaSettings.validate(itemSettings, assertValid);
							break;		
					}
				} catch (e) {
					if (e instanceof ValidationError) yield [e, item];
					else throw e;
				}
			}
		}
	}
}

export function showValidationWindow() {
	addDialog(ValidationDialog, {
		content: validateProject(),
		id: "validationDialog",
		title: "edit.validationResult",
		style: { "align-self": "flex-end" }
	});
}
