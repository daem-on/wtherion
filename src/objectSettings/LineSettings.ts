enum Place { Default, Bottom, Top }
enum Outline { Default, In, Out, None }
enum Clip { Default, On, Off }

export default class LineSettings {
	otherSettings: string;
	subtypes: Record<number, string>;
	reverse: boolean;
	place: Place;
	clip: Clip;
	invisible: boolean;
	outline: Outline;
	size?: number;
	id: string;
	private _type: string;

	get type() { return this._type }
	set type(val: string) {
		this._type = val;
	}

	static defaultSettings(): LineSettings {
		let ls = new LineSettings();
		ls.otherSettings = "";
		ls.subtypes = {};
		ls.reverse = false;
		ls.place = Place.Default;
		ls.clip = Clip.Default;
		ls.invisible = false;
		ls.outline = Outline.Default;
		ls.id = "";
		ls._type = "wall";
		return ls;
	}
}

export function getSettings(path: paper.Path | {data: {therionData: {}}}) {
	return path.data.therionData as LineSettings;
}