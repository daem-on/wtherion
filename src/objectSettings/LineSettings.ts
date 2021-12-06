type Place = "bottom" | "default" | "top";
type Outline = "in" | "out" | "none";
type Clip = "-" | "on" | "off";

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
		if (val === "wall") {
			this.outline = "out";
		} else {
			this.outline = "none";
		}
	}

	static defaultSettings(): LineSettings {
		let ls = new LineSettings();
		ls.otherSettings = "";
		ls.subtypes = {};
		ls.reverse = false;
		ls.place = "default";
		ls.clip = "-";
		ls.invisible = false;
		ls.outline = "out";
		ls.id = "";
		ls._type = "wall";
		return ls;
	}
}

export function getSettings(path: paper.Path | {data: {therionData: {}}}) {
	return path.data.therionData as LineSettings;
}