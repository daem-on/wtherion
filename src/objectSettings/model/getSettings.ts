import AreaSettings from "./AreaSettings";
import LineSettings from "./LineSettings";
import PointSettings from "./PointSettings";
import ScrapSettings from "./ScrapSettings";


export default function getSettings(path: paper.Path | { data: { therionData: {}; }; }) {
	return path.data.therionData as LineSettings | PointSettings | AreaSettings | ScrapSettings;
}
