import { Clip, Place } from "./LineSettings";

export default class PointSettings {

	static readonly stringSettings: ReadonlyArray<string> = 
		["type", "scale", "name", "text", "value", "id"];

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
	rotation: number;
	id: string;

	static defaultSettings(): PointSettings {
		const ls = new PointSettings();
		ls.type = "station";
		ls.otherSettings = "";
		ls.name = "";
		ls.clip = Clip.Default;
		ls.place = Place.Default;
		ls.invisible = false;
		ls.scale = "m";
		ls.text = "";
		ls.value = "";
		ls.rotation = 0;
		ls.id = "";
		return ls;
	}
}