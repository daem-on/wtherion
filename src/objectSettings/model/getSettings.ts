import { ReactiveMap } from "../reactiveMap";
import AreaSettings from "./AreaSettings";
import { LineSettings } from "./LineSettings";
import { PointSettings } from "./PointSettings";
import { ScrapSettings } from "./ScrapSettings";

type SettingType<T> = 
	T extends paper.Path ? (ReactiveMap<LineSettings> | AreaSettings) :
	T extends paper.SymbolItem ? ReactiveMap<PointSettings> :
	T extends paper.Layer ? ReactiveMap<ScrapSettings> :
	never;

export type PaperItemType = paper.Path | paper.SymbolItem | paper.Layer;

export default function getSettings<T extends PaperItemType>(item: T): SettingType<T> {
	return item.data.therionData as SettingType<T>;
}
