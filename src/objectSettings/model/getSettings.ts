import AreaSettings from "./AreaSettings";
import LineSettings from "./LineSettings";


export default function getSettings(path: paper.Path | { data: { therionData: {}; }; }) {
	let d = path.data.therionData;
	if (d.className == "LineSettings")
		return d as LineSettings;
	if (d.className == "AreaSettings")
		return d as AreaSettings;
}
