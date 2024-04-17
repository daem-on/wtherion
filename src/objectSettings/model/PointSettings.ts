import type { AssertFunction } from "../../validate";
import { Clip, Place } from "./LineSettings";

export default class PointSettings {

	static readonly exportStringSettings: ReadonlyArray<string> =
		["subtype", "name", "text", "value", "id"];
	static readonly stringSettings: ReadonlyArray<string> = 
		["type", "scale", ...this.exportStringSettings];

	readonly className = "PointSettings";
	type: string;
	subtype: string;
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
		ls.subtype = "";
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

	static validate(s: PointSettings, assertValid: AssertFunction) {
		for (const setting of this.stringSettings) {
			assertValid(!(s[setting] == null), `Missing ${setting}`, s);
		}
		assertValid(!(s.otherSettings == null), `Missing otherSettings`, s);
		assertValid(!(s.rotation == null), `Missing rotation`, s);
		if (s.type === "station") {
			assertValid(!(s.name == null), `Missing name`, s);
			assertValid(s.rotation === 0, `Station rotation must be 0`, s);
			assertValid(!s.name.includes(" "), `Station name cannot contain spaces`, s);
		}
		assertValid(!(s.invisible == null), `Missing invisible`, s);
		assertValid(Object.values(Clip).includes(s.clip), `Invalid clip`, s);
		assertValid(Object.values(Place).includes(s.place), `Invalid place`, s);
	}
}