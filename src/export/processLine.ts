import LineSettings from "../objectSettings/model/LineSettings";
import { toGlobal } from "./processProject";
import { CompoundPathExportData, CurvedSegment, PathExportData, Segment } from "./models";
import getSettingsInExport, { pushWithWhitespace } from "./util";

function isCurved(segment: Segment): segment is CurvedSegment {
	return segment.length >= 3;
}

export function processLine(item: PathExportData, settings?: LineSettings): string[] {
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

	if (item.closed)
		pushWithWhitespace(state, 1, "close on");

	for (let i = 0; i < segments.length + (item.closed ? 1 : 0); i++) {
		const line = [];
		const current = segments.at(i % segments.length);
		const last = segments.at(i - 1);

		if (i !== 0 || item.closed) {
			if (isCurved(last)) {
				if (isCurved(current))
					line.push(toGlobal(last[0], last[2]), toGlobal(current[0], current[1]));
				else
					line.push(toGlobal(last[0], last[2]), toGlobal(current));
			} else if (isCurved(current))
				line.push(toGlobal(last), toGlobal(current[0], current[1]));
		}

		line.push(isCurved(current) ? toGlobal(current[0]) : toGlobal(current));

		pushWithWhitespace(state, 1, line.join(" "));
		if (i in subtypes) {
			pushWithWhitespace(state, 1, "subtype " + subtypes[i]);
		}
		if (i in segmentSettings)
			for (const line of segmentSettings[i].split(";"))
				pushWithWhitespace(state, 1, line);
	}

	if (lineSettings.size !== undefined
		&& lineSettings.size !== 0)
		pushWithWhitespace(state, 1, "size " + lineSettings.size);
	state.push("endline");

	return state;
}

export function processCompoundPath(item: CompoundPathExportData): string[] {
	return item.children.flatMap(child => processLine(child, getSettingsInExport(child) as LineSettings));
}
