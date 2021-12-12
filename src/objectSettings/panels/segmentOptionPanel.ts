import { componentList } from "../../../js/toolOptionPanel";
import LineSettings from "../model/LineSettings";
import getSettings from "../model/getSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
import pg from "../../init";
import wallList from "../../../js/res/walls-list.json";
	
const wallTypes = wallList.labels
	.concat(wallList.passages)
	.concat(wallList["passage fills"])
	.concat(wallList.special);
	
let optionsCache = {
	subTypeEnable: false,
	subType: undefined,
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
		options: wallTypes,
		requirements: {
			subTypeEnable: true
		}
	},
	advancedSection: {
		type: "title",
		text: "Advanced"
	},
	id: {
		type: "text",
		label: "id"
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
		subType: undefined,
	};
	let settings = getSettings(line) as LineSettings;
	for (let segment of line.segments)
		if (segment.selected) selectedSegment = segment;
	
	if (settings.subtypes[selectedSegment.index]) {
		optionsCache.subTypeEnable = true;
		optionsCache.subType = settings.subtypes[selectedSegment.index];
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
		
	let modifyObject = () => {
		if (optionsCache.subTypeEnable) {
			settings.subtypes[selectedSegment.index] = optionsCache.subType;
		} else if (settings.subtypes[selectedSegment.index]) {
			delete settings.subtypes[selectedSegment.index];
		}
	}
	return {
		options: optionsCache,
		components: components,
		callback: modifyObject,
	}
}