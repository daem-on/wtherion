import { Ref, ref } from "vue";
import { getSelectedItems } from "../selection";
import { PaperItemType } from "./model/getSettings";

export const selectedObjects: Ref<PaperItemType[]> = ref([]);
export const selectedSegments: Ref<paper.Segment[]> = ref([]);

export function updateWindow(watchSegments = false) {
	const selected = getSelectedItems() as PaperItemType[];
	selectedObjects.value = selected;

	if (watchSegments && selected.length) {
		const first = selected[0];
		if (first.className !== "Path") return;
		selectedSegments.value = (first as paper.Path).segments.filter(segment => segment.selected);
	}
}

