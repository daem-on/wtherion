import LineSettings from "../objectSettings/model/LineSettings";
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

	let optionsString = "";
	{
		const s = lineSettings;
		const o = [];
		o.push(s.type);
		if (item.closed)
			o.push("-close on");
		if (s.id !== "")
			o.push("-id " + s.id);
		if (s.subtype !== "")
			o.push(`-subtype ${s.subtype}`);
		if (s.text !== "")
			o.push(`-text "${s.text}"`);
		if (s.clip !== 0)
			o.push("-clip " + ["", "on", "off"][s.clip]);
		if (s.invisible === true)
			o.push("-visibility off");
		if (s.reverse === true)
			o.push("-reverse on");
		if (s.outline !== 0)
			o.push("-outline " + ["", "in", "out", "none"][s.outline]);
		if (s.place !== 0)
			o.push("-place " + ["", "bottom", "top"][s.place]);
		// // not sure what's up with this, apparently can't be set here
		// if (s.size !== undefined && s.size !== 0)
		// 	o.push("-size " + s.size);
		if (s.otherSettings !== "")
			o.push(s.otherSettings.replace(/\n/g, " "));
		optionsString = o.join(" ");
	}

	state.push("line " + optionsString);

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
