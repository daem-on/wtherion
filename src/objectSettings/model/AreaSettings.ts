import type { AssertFunction } from "../../validation/assertTypes.ts";
import { ReactiveMap, reactiveMap } from "../reactiveMap.ts";
import { LineSettings, validateLineSettings } from "./LineSettings";

export type AreaSettings = {
	className: "AreaSettings";
	type?: string;
	lineSettings?: LineSettings;
	invisible: boolean;
};

export function defaultAreaSettings(): ReactiveMap<AreaSettings> {
	return reactiveMap({
		className: "AreaSettings",
		invisible: false,
	});
}

export function validateAreaSettings(s: AreaSettings, assertValid: AssertFunction) {
	validateLineSettings(s.lineSettings, assertValid);
	assertValid(!(s.type == null), `Missing type`, s);
	assertValid(!(s.invisible == null), `Missing invisible`, s);
}

export function areaSettingsToString(s: AreaSettings): string {
	return Object.entries(s)
		.filter(([key, value]) => {
			return value != null
				&& value !== ""
				&& key !== "type"
				&& key !== "className"
				&& key !== "lineSettings"
				&& !(!value && key !== "invisible");
		})
		.map(([key, value]) => {
			if (key === "invisible") {
				return "-visibility off";
			}
			return `-${key} ${value}`;
		})
		.join(" ");
}
