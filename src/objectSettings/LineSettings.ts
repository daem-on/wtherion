enum Place { Default, Bottom, Top }
enum Outline { Default, In, Out, None }
enum Clip { Default, On, Off }

export default class LineSettings {
	readonly className = "LineSettings";
	otherSettings: string;
	subtype: string;
	subtypes: Record<number, string>;
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

export class AreaSettings {
	readonly className = "AreaSettings";
	type: string;
	lineSettings: LineSettings;
	invisible: boolean;

	static defaultSettings(): AreaSettings {
		let as = new AreaSettings();
		as.type = "water";
		as.invisible = false;
		return as;
	}
}

export function getSettings(path: paper.Path | {data: {therionData: {}}}) {
	let d = path.data.therionData;
	if (d.className == "LineSettings")
		return d as LineSettings;
	if (d.className == "AreaSettings")
		return d as AreaSettings;
}