import { Clip, Place } from "./LineSettings";

export default class PointSettings {
	readonly className = "PointSettings";
	type: string;
	otherSettings: string;
	name: string;
	clip: Clip;
	place: Place;
	invisible: boolean;
	scale: string;
	text: string;
	value: string;
	id: string;

	static defaultSettings(): PointSettings {
		let ls = new PointSettings();
		ls.type = "station";
		ls.otherSettings = "";
		ls.name = "";
		ls.clip = Clip.Default;
		ls.place = Place.Default;
		ls.invisible = false;
		ls.scale = "m";
		ls.text = "";
		ls.value = "";
		ls.id = "";
		return ls;
	}
}