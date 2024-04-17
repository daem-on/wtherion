import LineSettings from "../objectSettings/model/LineSettings";
import getSettings from "../objectSettings/model/getSettings";
import { addText, toGlobal, addWhitespace } from "./processProject";
import { CompoundPathExportData, CurvedSegment, PathExportData, Segment } from "./models";

function isCurved(segment: Segment): segment is CurvedSegment {
	return segment.length >= 3;
}

export function processLine(item: PathExportData, settings?: LineSettings) {
	const segments = item.segments;
	if (!segments || segments.length < 2)
		return;

	const lineSettings = settings || getSettings(item as any) as LineSettings;
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

	addText("line " + optionsString);
	addWhitespace(1);

	if (item.closed)
		addText("close on");

	for (let i = 0; i < segments.length + (item.closed ? 1 : 0); i++) {
		const output = [];
		const current = segments.at(i % segments.length);
		const last = segments.at(i - 1);

		if (i !== 0 || item.closed) {
			if (isCurved(last)) {
				if (isCurved(current))
					output.push(toGlobal(last[0], last[2]), toGlobal(current[0], current[1]));
				else
					output.push(toGlobal(last[0], last[2]), toGlobal(current));
			} else if (isCurved(current))
				output.push(toGlobal(last), toGlobal(current[0], current[1]));
		}

		output.push(isCurved(current) ? toGlobal(current[0]) : toGlobal(current));

		addText(output.join(" "));
		if (i in subtypes) {
			addText("subtype " + subtypes[i]);
		}
		if (i in segmentSettings)
			for (const line of segmentSettings[i].split(";"))
				addText(line);
	}

	if (lineSettings.size !== undefined
		&& lineSettings.size !== 0)
		addText("size " + lineSettings.size);
	addWhitespace(-1);
	addText("endline");
}

export function processCompoundPath(item: CompoundPathExportData) {
	for (const child of item.children)
		processLine(child);
}
