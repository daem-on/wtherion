import type { AssertFunction } from "../../validation/assertTypes.ts";
import { ReactiveMap, reactiveMap } from "../reactiveMap.ts";
import { trimEnclosing, wrapIfNeeded } from "../util.ts";

const rawStringSettings: ReadonlyArray<string> = ["author", "copyright"];
const bracketSettings: ReadonlyArray<string> = ["scale", "projection"];
const stringSettings = [...rawStringSettings, ...bracketSettings];

export type ScrapSettings = {
	className: "ScrapSettings";
	projection?: string;
	scale?: string;
	author?: string;
	copyright?: string;
	stationNames?: string;
};

export function defaultScrapSettings(): ReactiveMap<ScrapSettings> {
	return reactiveMap<ScrapSettings>({
		className: "ScrapSettings",
	});
}

export function scrapSettingsFromParsed(parsed: Record<string, string>): ReactiveMap<ScrapSettings> {
	const settings = defaultScrapSettings();
	for (const key in parsed) {
		settings[key] = trimEnclosing(parsed[key]);
	}
	return settings;
}

export function validateScrapSettings(s: ScrapSettings, assertValid: AssertFunction) {
	for (const setting of stringSettings) {
		assertValid(!(s[setting] == null), `Missing ${setting}`, s);
	}

	const dateAndStringformat = /^[0-9-.]+ (".+"|[^ ]+)$/g;
	if (s.author.trim())
		assertValid(dateAndStringformat.test(s.author.trim()), `Invalid author`, s);
	if (s.copyright.trim())
		assertValid(dateAndStringformat.test(s.copyright.trim()), `Invalid copyright`, s);
}

export function scrapSettingsToString(s: ScrapSettings): string {
	return Object.entries(s)
		.filter(([key, value]) => {
			return value != null && value !== "" && key !== "className";
		})
		.map(([key, value]) => {
			if (bracketSettings.includes(key)) return `-${key} ${wrapIfNeeded(value, true)}`;
			if (key === "stationNames") return `-station-names ${value}`;
			return `-${key} ${value}`;
		})
		.join(" ");
}
