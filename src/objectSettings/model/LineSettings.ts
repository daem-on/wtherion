import type { AssertFunction } from "../../validation/assertTypes.ts";
import { ReactiveMap, reactiveMap } from "../reactiveMap.ts";
import { trimEnclosing, wrapIfNeeded } from "../util.ts";

export type LineSettings = {
	className: "LineSettings";
	subtype?: string;
	subtypes: Record<number, string>;
	segmentSettings: Record<number, string>;
	reverse?: boolean;
	place?: string;
	clip?: string;
	invisible: boolean;
	outline?: string;
	size?: number;
	text?: string;
	id?: string;
	type: string;
};

const stringSettings = ["subtype", "id", "text", "place", "clip", "outline"];

export function defaultLineSettings(): ReactiveMap<LineSettings> {
	return  reactiveMap<LineSettings>({
		className: "LineSettings",
		type: "wall",
		subtypes: {},
		segmentSettings: {},
		invisible: false,
	});
}

export function lineSettingsFromParsed(parsed: Record<string, string>): ReactiveMap<LineSettings> {
	const settings = defaultLineSettings();
	for (const [key, value] of Object.entries(parsed)) {
		if (stringSettings.includes(key)) {
			settings[key] = trimEnclosing(value);
		} else {
			switch (key) {
				case "visibility":
					delete settings.invisible;
					settings.invisible = value === "off";
					break;
				case "close":
					break;
				default:
					settings[key] = value;
					break;
			}
		}
	}
	return settings;
}

export function validateLineSettings(s: LineSettings, assertValid: AssertFunction) {
	for (const setting of stringSettings) {
		assertValid(!(s[setting] == null), `Missing ${setting}`, s);
	}
}

export function lineSettingsToString(s: LineSettings): string {
	return Object.entries(s)
		.filter(([key, value]) => {
			return value != null
				&& value !== ""
				&& key !== "type"
				&& key !== "className"
				&& key !== "subtypes"
				&& key !== "segmentSettings"
				&& !(!value && (key === "invisible" || key === "reverse"));
		})
		.map(([key, value]) => {
			if (stringSettings.includes(key)) {
				return `-${key} ${wrapIfNeeded(value as string, false)}`;
			}
			switch (key) {
				case "invisible":
					return "-visibility off";
				case "reverse":
					return "-reverse on";
				default:
					return `-${key} ${value}`;
			}
		})
		.join(" ");
}
