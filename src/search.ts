import { addDialog } from "@daem-on/graphite/modal";
import getSettings from "./objectSettings/model/getSettings";
import paper from "paper";
import SearchDialog from "./components/dialogs/SearchDialog.vue";
import { markRaw, ref } from "vue";

export const searchResults = ref<paper.Item[]>([]);

export function openSearchDialog() {
	addDialog(SearchDialog, { id: "searchWindow", content: undefined, title: "Search" });
}

export function search(query: string) {
	const re = new RegExp(query, "i");
	searchResults.value.length = 0;

	for (const item of paper.project.getItems({ recursive: true })) {
		const s = getSettings(item as any);

		const match = (
			("id" in s && s.id.match(re)) ||
			("name" in s && s.name.match(re)) ||
			("text" in s && s.text.match(re)) ||
			("value" in s && s.value.match(re))
		);

		if (match) searchResults.value.push(markRaw(item));
	}
}