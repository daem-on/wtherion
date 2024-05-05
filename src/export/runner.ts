import paper from "paper";
import { ProjectExportResult } from "./models";
import { get } from "../filesio/configManagement";

export type ExportWorkerData = {
	result: ProjectExportResult,
	format?: string
}

export async function asBlob() {
	return new Blob([await asString()], { type: "text/th2" });
}
		
export async function asString() {
	const result = paper.project.exportJSON({asString: false, precision: 2}) as any;
	const format = get("exportFormat");
	return await runWorker({ result, format });
}

export function runWorker(data: ExportWorkerData) {
	return new Promise<string>((resolve, reject) => {
		const worker = new Worker(new URL("./worker", import.meta.url), {
			type: "module"
		});
		worker.postMessage(JSON.stringify(data));
		worker.onmessage = response => {
			resolve(response.data);
			worker.terminate();
		};
		worker.onerror = error => {
			reject(error);
			error.preventDefault();
			worker.terminate();
		};
	});
}
