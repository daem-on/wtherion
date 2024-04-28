import type { AssertFunction } from "../../validation/assertTypes.ts";

export default class ScrapSettings {
	
	static readonly rawStringeSettings: ReadonlyArray<string> = 
		["author", "copyright"];
	static readonly bracketSettings: ReadonlyArray<string> = 
		["scale", "projection"];
	static readonly stringSettings = [...ScrapSettings.rawStringeSettings, ...ScrapSettings.bracketSettings];

	readonly className = "ScrapSettings";
	projection: string;
	scale: string;
	author: string;
	copyright: string;
	stationNames: string;
	otherSettings: string;

	static defaultSettings(): ScrapSettings {
		const s = new ScrapSettings();
		s.projection = "";
		s.scale = "";
		s.author = "";
		s.copyright = "";
		s.stationNames = "";
		s.otherSettings = "";
		return s;
	}

	static validate(s: ScrapSettings, assertValid: AssertFunction) {
		for (const setting of this.stringSettings) {
			assertValid(!(s[setting] == null), `Missing ${setting}`, s);
		}
		assertValid(!(s.otherSettings == null), `Missing otherSettings`, s);

		const dateAndStringformat = /^[0-9-.]+ (".+"|[^ ]+)$/g;
		if (s.author.trim())
			assertValid(dateAndStringformat.test(s.author.trim()), `Invalid author`, s);
		if (s.copyright.trim())
			assertValid(dateAndStringformat.test(s.copyright.trim()), `Invalid copyright`, s);
	}
}
