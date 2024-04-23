import type { ProjectExportResult } from './models';
import { processProject } from './processProject';
import { defaultExportFormatter } from './util';

self.onmessage = ({ data }: { data: ProjectExportResult }) => {
	const result = processProject(data, defaultExportFormatter);
	const text = result.join("\n");
	self.postMessage(text);
};
