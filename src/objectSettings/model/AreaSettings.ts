import LineSettings from "./LineSettings";

export default class AreaSettings {
	readonly className = "AreaSettings";
	type: string;
	lineSettings: LineSettings;
	invisible: boolean;

	static defaultSettings(): AreaSettings {
		const as = new AreaSettings();
		as.type = "water";
		as.invisible = false;
		return as;
	}
}
