import type { AssertFunction } from "../../validation/assertTypes.ts";
import { LineSettings, validateLineSettings } from "./LineSettings";

export default class AreaSettings {
	readonly className = "AreaSettings";
	type: string;
	lineSettings: LineSettings;
	invisible: boolean;

	static defaultSettings(): AreaSettings {
		const as = new AreaSettings();
		as.type = "water";
		as.invisible = false;
		return as;
	}

	static validate(s: AreaSettings, assertValid: AssertFunction) {
		validateLineSettings(s.lineSettings, assertValid);
		assertValid(!(s.type == null), `Missing type`, s);
		assertValid(!(s.invisible == null), `Missing invisible`, s);
	}
}
