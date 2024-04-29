import { processProject } from './processProject';
import type { ExportWorkerData } from './runner';
import { getFormatter } from './util';

self.onmessage = ({ data }: { data: ExportWorkerData }) => {
	const result = processProject(data.result, getFormatter(data.format));
	const text = result.join("\n");
	self.postMessage(text);
};
