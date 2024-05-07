import paper from "paper";
import { ref } from "vue";
import { ScrapSettings } from "./objectSettings/model/ScrapSettings";
import getSettings from "./objectSettings/model/getSettings";
import { ReactiveMap } from "./objectSettings/reactiveMap";
import { triggers } from "./triggers";

export const currentScrap = ref<{ name: string, settings: ReactiveMap<ScrapSettings> } | null>(null);

function handleLayerChange() {
	if (!paper.project) return;
	const result = getSettings(paper.project.activeLayer);
	if (result) {
		currentScrap.value = {
			name: paper.project.activeLayer.name,
			settings: result
		};
	} else {
		currentScrap.value = null;
	}
}
handleLayerChange();

triggers.onAny(["LayerAdded", "LayerRemoved", "LayersChanged"], handleLayerChange);
