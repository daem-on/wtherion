import { assertValid } from "../../validate";

export default class ScrapSettings {
	
	static readonly stringSettings: ReadonlyArray<string> = 
		["scale", "projection", "author", "copyright"];

	readonly className = "ScrapSettings";
	projection: string;
	scale: string;
	author: string;
	copyright: string;
	otherSettings: string;

	static defaultSettings(): ScrapSettings {
		const s = new ScrapSettings();
		s.projection = "";
		s.scale = "";
		s.author = "";
		s.copyright = "";
		s.otherSettings = "";
		return s;
	}

	static validate(s: ScrapSettings) {
		for (const setting of this.stringSettings) {
			assertValid(!(s[setting] == null), `Missing ${setting}`, s);
		}
		assertValid(!(s.otherSettings == null), `Missing otherSettings`, s);

		const dateAndStringformat = /^[0-9-.]+ (".+"|[^ ]+)$/g;
		assertValid(dateAndStringformat.test(s.author.trim()), `Invalid author`, s);
		assertValid(dateAndStringformat.test(s.copyright.trim()), `Invalid copyright`, s);
	}
}
