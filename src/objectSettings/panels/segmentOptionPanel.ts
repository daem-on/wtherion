import { componentList } from "../../../js/toolOptionPanel";
import LineSettings from "../model/LineSettings";
import getSettings from "../model/getSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
import pg from "../../init";
import subtypes from "../../../js/res/subtype-list.json";
	
let optionsCache = {
	subTypeEnable: false,
	subType: undefined,
	otherSettings: undefined,
};
	
let selectedSegment: paper.Segment = undefined;
	
const components: componentList = {
	lastSubtypeLabel: {
		label: ""
	},
	nextSubtypeLabel: {
		label: ""
	},
	subTypeEnable: {
		type: "boolean",
		label: "Define subtype"
	},
	subType: {
		type: "customList",
		label: "Type",
		options: subtypes.wall.slice(1),
		requirements: {
			subTypeEnable: true
		},
		imageRoot: "/assets/rendered/subtype"
	},
	advancedSection: {
		type: "title",
		text: "Advanced"
	},
	otherSettings: {
		type: "text",
		label: "Other settings"
	},
}
	
const sizeComponent: componentList = {
	size: {
		type: "int",
		label: "Size"
	}
}
	
export default function(line: paper.Path): objectOptionPanelConfig {
	optionsCache = {
		subTypeEnable: false,
		subType: "bedrock",
		otherSettings: ""
	};
	let settings = getSettings(line);
	if (settings.className !== "LineSettings") return;
	
	for (let segment of line.segments)
	if (segment.selected) selectedSegment = segment;
	
	if (settings.subtypes[selectedSegment.index]) {
		optionsCache.subTypeEnable = true;
		optionsCache.subType = settings.subtypes[selectedSegment.index];
	}
	if (settings.segmentSettings[selectedSegment.index]) {
		optionsCache.otherSettings = settings.segmentSettings[selectedSegment.index];
	}
	
	if (Object.keys(settings.subtypes).length >= 1) {
		let lastSubtype: number = undefined;
		let nextSubtype: number = undefined;
		for (const key in settings.subtypes) {
			if (Object.prototype.hasOwnProperty.call(settings.subtypes, key)) {
				let index = key as unknown as number;
				if (index < selectedSegment.index) lastSubtype = index;
				if (index > selectedSegment.index) {nextSubtype = index; break;}
			}
		}
		components.lastSubtypeLabel.label =
			lastSubtype ?
			`This segment's subtype is ${settings.subtypes[lastSubtype]}, defined at #${lastSubtype}.` :
			`This segment is the default subtype, no definitions before it.`;
		components.nextSubtypeLabel.label =
			nextSubtype ?
			`This subtype continues until #${nextSubtype} where it changes to ${settings.subtypes[nextSubtype]}.` :
			`The rest of this line is the same subtype as this.`;
	} else {
		components.lastSubtypeLabel.label = "This line contains no subtype definitions";
		components.nextSubtypeLabel.label = "";
	}

	let s = settings as LineSettings;
	let modifyObject = () => {
		if (optionsCache.subTypeEnable) {
			s.subtypes[selectedSegment.index] = optionsCache.subType;
		} else if (s.subtypes[selectedSegment.index]) {
			delete s.subtypes[selectedSegment.index];
		}
		if (optionsCache.otherSettings !== "") {
			s.segmentSettings[selectedSegment.index] = optionsCache.otherSettings;
		} else if (s.segmentSettings[selectedSegment.index]) {
			delete s.segmentSettings[selectedSegment.index];
		}
	}
	return {
		options: optionsCache,
		components: components,
		callback: modifyObject,
	}
}