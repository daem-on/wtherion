import { LineSettings, lineSettingsToString } from "../objectSettings/model/LineSettings";
import { toGlobal } from "./processProject";
import { CompoundPathExportData, CurvedSegment, PathExportData, Segment } from "./models";
import { getSettingsInExport, ExportFormatter } from "./util";

function isCurved(segment: Segment): segment is CurvedSegment {
	return segment.length >= 3;
}

export function processLine(item: PathExportData, format: ExportFormatter, settings?: LineSettings): string[] {
	const segments = item.segments;
	if (!segments || segments.length < 2)
		return [];

	const state: string[] = [];

	const lineSettings = settings || getSettingsInExport(item) as LineSettings;
	const subtypes = lineSettings.subtypes;
	const segmentSettings = lineSettings.segmentSettings;

	const optionsString = lineSettingsToString(lineSettings);
	const closedString = item.closed ? " -close on" : "";
	state.push(`line ${lineSettings.type}${closedString} ${optionsString}`.trim());

	const toGlobalF = (global: number[], local = [0, 0]) => toGlobal(global, local, format);
	const addStartCurve = item.closed && !format.skipStartCurve;
	const outputSegments = item.closed ? segments.length + 1 : segments.length;

	for (let i = 0; i < outputSegments; i++) {
		const line = [];
		const current = segments.at(i % segments.length);
		const prev = segments.at(i - 1);

		if (i !== 0 || addStartCurve) {
			if (isCurved(prev)) {
				if (isCurved(current))
					line.push(toGlobalF(prev[0], prev[2]), toGlobalF(current[0], current[1]));
				else
					line.push(toGlobalF(prev[0], prev[2]), toGlobalF(current));
			} else if (isCurved(current))
				line.push(toGlobalF(prev), toGlobalF(current[0], current[1]));
		}

		line.push(isCurved(current) ? toGlobalF(current[0]) : toGlobalF(current));

		format.pushGroup(state, line.join(" "));
		if (i in subtypes) {
			format.pushGroup(state, "subtype " + subtypes[i]);
		}
		if (i in segmentSettings)
			for (const line of segmentSettings[i].split(";"))
				format.pushGroup(state, line);
	}

	if (lineSettings.size !== undefined
		&& lineSettings.size !== 0)
		format.pushGroup(state, "size " + lineSettings.size);
	state.push("endline");

	return state;
}

export function processCompoundPath(item: CompoundPathExportData, format: ExportFormatter): string[] {
	return item.children.flatMap(child => processLine(child, format, getSettingsInExport(child) as LineSettings));
}
