import AreaSettings from "./AreaSettings";
import LineSettings from "./LineSettings";
import PointSettings from "./PointSettings";
import ScrapSettings from "./ScrapSettings";

type SettingType<T> = 
	T extends paper.Path ? (LineSettings | AreaSettings) :
	T extends paper.Shape ? PointSettings :
	T extends paper.Layer ? ScrapSettings :
	never;

export type PaperItemType = paper.Path | paper.Shape | paper.Layer;

export default function getSettings<T extends PaperItemType>(item: T): SettingType<T> {
	return item.data.therionData as SettingType<T>;
}
