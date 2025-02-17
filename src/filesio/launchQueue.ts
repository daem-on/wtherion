import { loadJSONDocument } from "../document";
import { importTH2 } from "../import/importWrapper.ts";

export function setup() {
	if ("launchQueue" in window) {	
		(window as any).launchQueue.setConsumer(launchParams => {
			handleFiles(launchParams.files);
		});
	}
}

async function handleFiles(files: FileSystemFileHandle[]) {
	if (files.length > 0) {
		const file = files[0];
        const blob = await file.getFile();
        const text = await blob.text();

        if (file.name.endsWith(".th2")) {
			importTH2(text);
		} else if (file.name.endsWith(".json") || file.name.endsWith(".wth")) {
			loadJSONDocument(text);
		}
    }
}