import paper from "paper";
import getSettings from "./objectSettings/model/getSettings";
import ScrapSettings from "./objectSettings/model/ScrapSettings";

function isExportableChild(item: paper.Item) {
	return item.className == "Path"
	|| item.className == "Shape"
	|| item.className == "CompoundPath";
}

export function validateProject() {
	const project = paper.project;

	for (const layer of project.layers) {
		if (layer.isEmpty) continue;
		if (!layer.children.some(isExportableChild)) continue;
		const layerSettings = getSettings(layer);
		validateLayer(layerSettings);
	}
}

function validateLayer(settings: ScrapSettings) {
	
}