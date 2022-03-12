export default class ScrapSettings {
	
	static readonly stringSettings: ReadonlyArray<string> = 
		["projection", "scale", "author", "copyright"];

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
		return s;
	}
}
