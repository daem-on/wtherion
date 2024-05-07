import type { AssertFunction } from "../../validation/assertTypes.ts";
import { ReactiveMap, reactiveMap } from "../reactiveMap.ts";
import { trimEnclosing, wrapIfNeeded } from "../util.ts";

export type PointSettings = {
	className: "PointSettings";
	type: string;
	subtype?: string;
	name?: string;
	clip?: string;
	place?: string;
	invisible: boolean;
	scale?: string;
	text?: string;
	value?: string;
	id?: string;
};

const exportStringSettings = ["subtype", "name", "text", "value", "id", "scale", "place", "clip"];
const stringSettings = ["type", ...exportStringSettings];

export function defaultPointSettings(): ReactiveMap<PointSettings> {
	return reactiveMap<PointSettings>({
		className: "PointSettings",
		type: "station",
		invisible: false,
	});
}

export function pointSettingsFromParsed(parsed: Record<string, string>): ReactiveMap<PointSettings> {
	const settings = defaultPointSettings();
	for (const [key, value] of Object.entries(parsed)) {
		if (stringSettings.includes(key)) {
			settings[key] = trimEnclosing(value);
		} else {
			switch (key) {
				case "visibility":
					delete settings.invisible;
					settings.invisible = value === "off";
					break;
				case "orient":
				case "orientation":
					break;
				default:
					settings[key] = value;
					break;
			}
		}
	}
	return settings;
}

export function validatePointSettings(s: PointSettings, assertValid: AssertFunction) {
	for (const setting of stringSettings) {
		assertValid(!(s[setting] == null), `Missing ${setting}`, s);
	}
	if (s.type === "station") {
		assertValid(!(s.name == null), `Missing name`, s);
		assertValid(!s.name.includes(" "), `Station name cannot contain spaces`, s);
	}
	assertValid(!(s.invisible == null), `Missing invisible`, s);
	assertValid([undefined, "default", "top", "bottom"].includes(s.clip), `Invalid clip`, s);
	assertValid([undefined, "on", "off"].includes(s.place), `Invalid place`, s);
}

export function pointSettingsToString(s: PointSettings): string {
	return Object.entries(s)
		.filter(([key, value]) => {
			return value != null
				&& value !== ""
				&& key !== "type"
				&& key !== "className"
				&& !(key === "invisible" && !value);
		})
		.map(([key, value]) => {
			if (exportStringSettings.includes(key)) {
				return `-${key} ${wrapIfNeeded(value as string, false)}`;
			}
			switch (key) {
				case "invisible":
					return "-visibility off";
				default:
					return `-${key} ${value}`;
			}
		})
		.join(" ");
}
