import importTH2 from "./import/importTH2";

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
		}
	}
}