import AreaSettings from "../objectSettings/model/AreaSettings.ts";
import type { LineSettings } from "../objectSettings/model/LineSettings.ts";
import type { PointSettings } from "../objectSettings/model/PointSettings.ts";
import ScrapSettings from "../objectSettings/model/ScrapSettings.ts";

export type AnySettings = AreaSettings | LineSettings | PointSettings | ScrapSettings;
export type AssertFunction = (value: boolean, message: string, settings: AnySettings) => void;
