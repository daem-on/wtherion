import type { ProjectExportResult } from './models';
import { processProject } from './processProject';

self.onmessage = ({ data }: { data: ProjectExportResult }) => {
	const result = processProject(data);
	const text = result.join("\n");
	self.postMessage(text);
};
