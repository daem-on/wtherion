import { componentList } from "../../../js/toolOptionPanel";
import LineSettings from "../model/LineSettings";
import getSettings from "../model/getSettings";
import { objectOptionPanelConfig } from "../objectOptionPanel";
	
let optionsCache = {
	x: undefined,
	y: undefined,
	handleInX: undefined,
	handleInY: undefined,
	handleOutX: undefined,
	handleOutY: undefined,
	otherSettings: undefined,
};

let selectedSegment: paper.Segment = undefined;

const components: componentList = {
	otherSettings: {
		type: "text",
		label: "Segment settings",
		tooltip: "Command-like options which will apply to this segment. Use a semicolon (;) to separate options."
	},
	x: {type: "float", label: "Position X,Y"},
	y: {type: "float", label: ""},
	handleInX: {type: "float", label: "Handle in X,Y"},
	handleInY: {type: "float", label: ""},
	handleOutX: {type: "float", label: "Handle out X,Y"},
	handleOutY: {type: "float", label: ""},
	actionsTitle: {type: "title", text: "Actions"},
	smooth: {type: "button", label: "Smooth", click: smooth},
	resetIn: {type: "button", label: "Reset handle in", click: resetIn},
	resetOut: {type: "button", label: "Reset handle out", click: resetOut},
	resetBoth: {type: "button", label: "Turn into corner", click:resetBoth},
}

// TODO: update panel with new values
function smooth() {if (selectedSegment) selectedSegment.smooth()}
function resetIn() {if (selectedSegment) selectedSegment.handleIn.length = 0}
function resetOut() {if (selectedSegment) selectedSegment.handleOut.length = 0}
function resetBoth() {if (selectedSegment) selectedSegment.clearHandles()}
	
export default function(line: paper.Path): objectOptionPanelConfig {
	optionsCache = {
		x: 0,
		y: 0,
		handleInX: 0,
		handleInY: 0,
		handleOutX: 0,
		handleOutY: 0,
		otherSettings: ""
	};
	const settings = getSettings(line);
	if (settings.className !== "LineSettings") return;
	
	for (const segment of line.segments)
		if (segment.selected) selectedSegment = segment;
	
	optionsCache.x = selectedSegment.point.x;
	optionsCache.y = selectedSegment.point.y;
	optionsCache.handleInX = selectedSegment.handleIn.x;
	optionsCache.handleInY = selectedSegment.handleIn.y;
	optionsCache.handleOutX = selectedSegment.handleOut.x;
	optionsCache.handleOutY = selectedSegment.handleOut.y;

	if (settings.segmentSettings[selectedSegment.index]) {
		optionsCache.otherSettings = settings.segmentSettings[selectedSegment.index];
	}

	const s = settings as LineSettings;
	const modifyObject = () => {
		selectedSegment.point.x = optionsCache.x,
		selectedSegment.point.y = optionsCache.y,
		selectedSegment.handleIn.x = optionsCache.handleInX;
		selectedSegment.handleIn.y = optionsCache.handleInY;
		selectedSegment.handleOut.x = optionsCache.handleOutX;
		selectedSegment.handleOut.y = optionsCache.handleOutY;
		
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