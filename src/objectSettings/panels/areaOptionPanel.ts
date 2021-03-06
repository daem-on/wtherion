import { componentList } from "../../toolOptionPanel";
import getSettings from "../model/getSettings";
import AreaSettings from "../model/AreaSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
import pg from "../../init";
import wallList from "Res/walls-list.json";
import areaList from "Res/area-list.json";

const wallTypes = wallList.labels
	.concat(wallList.passages)
	.concat(wallList["passage fills"])
	.concat(wallList.special);

const optionsCache = {
	lineType: undefined,
	lineSubtype: undefined,
	areaType: undefined,
	invisible: undefined,
	areaInvisible: undefined,
	id: undefined,
	// clip: undefined,
	// place: undefined,
	// outline: undefined,
	otherSettings: undefined,
};

const components: componentList<any> = {
	lineType: {
		type: "customList",
		label: "%outlineType%",
		options: wallTypes,
	},
	areaType: {
		type: "customList",
		label: "%areaType%",
		options: areaList,
		imageRoot: "assets/rendered/area"
	},
	invisible: {
		type: "boolean",
		label: "%invisible% (%areaOptions.outline%)"
	},
	areaInvisible: {
		type: "boolean",
		label: "%invisible% (%areaOptions.area%)"
	},
	advancedSection: {
		type: "title",
		text: "%advanced%"
	},
	id: {
		type: "text",
		label: "%id%"
	},
	otherSettings: {
		type: "text",
		label: "%otherSettings%"
	},
};

export default function(line: paper.Path): objectOptionPanelConfig {
	const settings = getSettings(line) as AreaSettings;
	
	optionsCache.areaType = settings.type;
	optionsCache.lineType = settings.lineSettings.type;
	optionsCache.invisible = settings.lineSettings.invisible;
	optionsCache.areaInvisible = settings.invisible;
	optionsCache.id = settings.lineSettings.id;
	optionsCache.otherSettings = settings.lineSettings.otherSettings;
	
	const modifyObject = () => {
		settings.type = optionsCache.areaType;
		settings.lineSettings.type = optionsCache.lineType;
		settings.lineSettings.invisible = optionsCache.invisible;
		settings.invisible = optionsCache.areaInvisible;
		settings.lineSettings.id = optionsCache.id;
		settings.lineSettings.otherSettings = optionsCache.otherSettings;
		pg.editTH2.drawArea(line);
	};

	return {
		options: optionsCache,
		components: components,
		callback: modifyObject,
	};
}