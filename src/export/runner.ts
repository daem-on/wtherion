import paper from "paper";

export async function asBlob() {
	return new Blob([await asString()], {type: "text/th2"});
}
		
export async function asString() {
	const data = paper.project.exportJSON({asString: false, precision: 2}) as any;
	return await runWorker(data);
}

export function runWorker(data: any) {
	return new Promise<string>((resolve, reject) => {
		const worker = new Worker(new URL("./worker", import.meta.url), {
			type: "module"
		});
		worker.postMessage(data);
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
