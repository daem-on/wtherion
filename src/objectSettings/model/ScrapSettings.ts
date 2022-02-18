enum Projection {none, plan, elevation, extended};

export default class ScrapSettings {
	
	static readonly stringSettings: ReadonlyArray<string> = 
		["scale", "author", "copyright"];

	readonly className = "ScrapSettings";
	projection: Projection;
	scale: string;
	author: string;
	copyright: string;
	otherSettings: string;

	static defaultSettings(): ScrapSettings {
		let s = new ScrapSettings();
		s.projection = Projection.plan;
		s.scale = "";
		s.author = "";
		s.copyright = "";
		return s;
	}
}
