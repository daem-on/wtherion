import paper from "paper";
import AreaSettings from "../objectSettings/model/AreaSettings.ts";
import getSettings from "../objectSettings/model/getSettings.ts";
import LineSettings from "../objectSettings/model/LineSettings.ts";
import { validatePointSettings } from "../objectSettings/model/PointSettings.ts";
import ScrapSettings from "../objectSettings/model/ScrapSettings.ts";
import { addDialog } from "../modal.ts";
import ValidationDialog from "../components/dialogs/ValidationDialog.vue";
import { AnySettings } from "./assertTypes.ts";

function isExportableChild(item: paper.Item) {
	return item.className === "Path"
	|| item.className === "SymbolItem"
	|| item.className === "CompoundPath";
}

class ValidationError extends Error {
	constructor(message: string, public settings: AnySettings) {
		super(message);
	}
}

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
							validatePointSettings(itemSettings, assertValid);
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
