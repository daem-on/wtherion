import paper from "paper";
import AreaSettings from "./objectSettings/model/AreaSettings";
import getSettings from "./objectSettings/model/getSettings";
import LineSettings from "./objectSettings/model/LineSettings";
import PointSettings from "./objectSettings/model/PointSettings";
import ScrapSettings from "./objectSettings/model/ScrapSettings";
import { clearSelection, focusItem } from "./selection";
import { setActiveLayer } from "./layer";

function isExportableChild(item: paper.Item) {
	return item.className === "Path"
	|| item.className === "Shape"
	|| item.className === "CompoundPath";
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

type ValidationResult = Iterable<[ValidationError, paper.Item]>;

function* validateProject(): ValidationResult {
	const project = paper.project;

	for (const layer of project.layers) {
		if (layer.isEmpty()) continue;
		if (!layer.children.some(isExportableChild)) continue;

		try {
			ScrapSettings.validate(getSettings(layer));
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
							LineSettings.validate(itemSettings);
							break;
						case "PointSettings":
							PointSettings.validate(itemSettings);
							break;
						case "AreaSettings":
							AreaSettings.validate(itemSettings);
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
	const result = Array.from(validateProject());

	jQuery("#validationResult").remove();
	const $content = jQuery(document.createElement("div"));

	if (result.length === 0) {
		$content.append(document.createTextNode("%edit.validationSuccess%"));
	} else {
		for (const item of result) {
			const $item = jQuery(document.createElement("a"));
			let tag = item[0].settings.className;
			if (item[1].name) tag += ` (${item[1].name})`;
			$item.append(document.createTextNode(
				`[${tag}]: ${item[0].message}`
			));
			if (item[1].className === "Layer") {
				$item.on("click", () => {
					clearSelection();
					setActiveLayer(item[1] as paper.Layer);
				});
			} else {
				$item.on("click", () => { focusItem(item[1]); });
			}
			$content.append($item);
		}
	}

	// TODO
}