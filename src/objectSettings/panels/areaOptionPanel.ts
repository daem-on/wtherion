import { componentList } from "../../../js/toolOptionPanel";
import LineSettings from "../model/LineSettings";
import getSettings from "../model/getSettings";
import AreaSettings from "../model/AreaSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
import pg from "../../init";
import wallList from "../../../js/res/walls-list.json";
import areaList from "../../../js/res/area-list.json";

const wallTypes = wallList.labels
	.concat(wallList.passages)
	.concat(wallList["passage fills"])
	.concat(wallList.special);

let optionsCache = {
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

const components: componentList = {
	lineType: {
		type: "customList",
		label: "Outline Type",
		options: wallTypes,
	},
	areaType: {
		type: "customList",
		label: "Area Type",
		options: areaList,
	},
	invisible: {
		type: "boolean",
		label: "Invisible outline"
	},
	areaInvisible: {
		type: "boolean",
		label: "Invisible area"
	},
	advancedSection: {
		type: "title",
		text: "Advanced"
	},
	id: {
		type: "text",
		label: "id"
	},
	otherSettings: {
		type: "text",
		label: "Other settings"
	},
}

export default function(line: paper.Path): objectOptionPanelConfig {
	let settings = getSettings(line) as AreaSettings;
	
	optionsCache.areaType = settings.type;
	optionsCache.lineType = settings.lineSettings.type;
	optionsCache.invisible = settings.lineSettings.invisible;
	optionsCache.areaInvisible = settings.invisible;
	optionsCache.id = settings.lineSettings.id;
	optionsCache.otherSettings = settings.lineSettings.otherSettings;
	
	let modifyObject = () => {
		settings.type = optionsCache.areaType;
		settings.lineSettings.type = optionsCache.lineType;
		settings.lineSettings.invisible = optionsCache.invisible;
		settings.invisible = optionsCache.areaInvisible;
		settings.lineSettings.id = optionsCache.id;
		settings.lineSettings.otherSettings = optionsCache.otherSettings;
		pg.editTH2.drawArea(line);
	}

	return {
		options: optionsCache,
		components: components,
		callback: modifyObject,
	}
}