import { importTH2 } from "../import/importWrapper.ts";
import { loadJSONDocument } from "../document";

export function cancelAll(event: Event) {
	event.preventDefault();
	event.stopPropagation();
}

export function drop(event: DragEvent) {
	const files = event.dataTransfer.files;
	if (files.length > 0) {
		const file = files[0];
		if (file.name.endsWith(".th2")) {
			const reader = new FileReader();
			reader.onload = () => importTH2(reader.result as string);
			reader.readAsText(file);
		} else if (file.name.endsWith(".json")) {
			const reader = new FileReader();
			reader.onload = () => loadJSONDocument(reader.result as string);
			reader.readAsText(file);
		}
	}
}