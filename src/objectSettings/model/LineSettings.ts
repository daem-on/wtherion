export enum Place { Default, Bottom, Top }
enum Outline { Default, In, Out, None }
export enum Clip { Default, On, Off }

export default class LineSettings {
	
	static readonly stringSettings: ReadonlyArray<string> = 
		["subtype", "id"];

	readonly className = "LineSettings";
	otherSettings: string;
	subtype: string;
	subtypes: Record<number, string>;
	segmentSettings: Record<number, string>;
	reverse: boolean;
	place: Place;
	clip: Clip;
	invisible: boolean;
	outline: Outline;
	size?: number;
	id: string;
	type: string;

	static defaultSettings(): LineSettings {
		let ls = new LineSettings();
		ls.otherSettings = "";
		ls.subtype = "";
		ls.subtypes = {};
		ls.segmentSettings = {};
		ls.reverse = false;
		ls.place = Place.Default;
		ls.clip = Clip.Default;
		ls.invisible = false;
		ls.outline = Outline.Default;
		ls.id = "";
		ls.type = "wall";
		ls.size = 0;
		return ls;
	}
}