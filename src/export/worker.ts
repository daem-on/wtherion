import { processProject } from './processProject';
import type { ExportWorkerData } from './runner';
import { getFormatter } from './util';

self.onmessage = ({ data }: { data: string }) => {
	const parsed = JSON.parse(data) as ExportWorkerData;
	const result = processProject(parsed.result, getFormatter(parsed.format));
	const text = result.join("\n");
	self.postMessage(text);
};
