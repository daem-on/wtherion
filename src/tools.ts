// functions related to tools

import select from "./tools/select";
import detailselect from "./tools/detailselect";
import draw from "./tools/draw";
import { bezier } from "./tools/bezier";
import { point } from "./tools/point";
import { viewgrab } from "./tools/viewgrab";
import { viewzoom } from "./tools/viewzoom";
import * as inspect from "./tools/inspect";
import paper from "paper";
import * as config from "./filesio/configManagement";
import { computed, ref } from "vue";

export const tools: Record<string, WtTool> = {
	select,
	detailselect,
	draw,
	bezier,
	point,
	viewgrab,
	viewzoom,
	inspect,
};

type ToolEvent<T extends Event> = paper.ToolEvent & { event: T };
type ToolEventMap = {
	"mousedown": ToolEvent<MouseEvent>,
	"mouseup": ToolEvent<MouseEvent>,
	"mousedrag": ToolEvent<MouseEvent>,
	"mousemove": ToolEvent<MouseEvent>,
	"keydown": paper.KeyEvent,
	"keyup": paper.KeyEvent,
	"wheel": WheelEvent,
	"activate": void,
	"deactivate": void,
};

type EventHandler<T extends keyof ToolEventMap> = (event: ToolEventMap[T]) => void
type EventHandlerRegisterer = <T extends keyof ToolEventMap>(eventName: T, handler: EventHandler<T>) => void;

type CustomHandlers = {
	onWheel?: EventHandler<"wheel">,
	onActivate?: EventHandler<"activate">,
	onDeactivate?: EventHandler<"deactivate">,
};

type WtTool = {
	tool: paper.Tool,
	definition: ToolDefinition,
	customHandlers: CustomHandlers,
};

export function defineTool(settings: {
	definition: ToolDefinition,
	setup: (on: EventHandlerRegisterer) => void
}): WtTool {
	const tool = new paper.Tool();
	const events: { eventName: keyof ToolEventMap, handler: EventHandler<any> }[] = [];
	const addEvent: EventHandlerRegisterer = (eventName, handler) => events.push({ eventName, handler });
	settings.setup(addEvent);

	const customHandlers: CustomHandlers = {};

	for (const event of events) {
		switch (event.eventName) {
			case "wheel": customHandlers.onWheel = event.handler; break;
			case "activate": customHandlers.onActivate = event.handler; break;
			case "deactivate": customHandlers.onDeactivate = event.handler; break;
			default: tool.on(event.eventName, event.handler);
		}
	}
	return {
		tool,
		customHandlers,
		definition: settings.definition,
	};
}

export function getToolList(): WtTool[] {
	return Object.values(tools);
}


export function getToolInfoByID(id: string) {
	for(let i=0; i<toolList.length; i++) {
		if(toolList[i].id === id) {
			return toolList[i];
		}
	}
}

type ToolSettings = {
	[key: string]: any,
	id: string
}

// localstorage
export function getLocalOptions<T extends ToolSettings>(options: T): T {
	const storageJSON = localStorage.getItem('pg.tools.'+options.id);
	if(storageJSON && storageJSON.length > 0) {
		const storageOptions = JSON.parse(storageJSON);
		
		// only overwrite options that are stored
		// new options will use their default value
		for(const option in options) {
			if(Object.prototype.hasOwnProperty.call(storageOptions, option)) {
				options[option] = storageOptions[option];
			}
		}
	}
	return options;
}


export function setLocalOptions(options: { id: string; }) {
	const optionsJSON = JSON.stringify(options, null, 2);
	localStorage.setItem('pg.tools.'+options.id, optionsJSON);
}


export function deleteLocalOptions(id: string) {
	localStorage.removeItem('pg.tools.'+id);
}

export type ToolDefinition = {
	id: string;
	name: string;
	type?: "hidden";
	usedKeys?: {
		[name: string]: string;
	},
	options: Record<string, any>
}

export type PGTool = {
	activateTool: () => void,
	deactivateTool: () => void,
	updateTool?: (e: WheelEvent) => void,
	options: ToolDefinition
}

export const keybinds: Record<string, string> = {
	"v": "select",
	"a": "detailselect",
	"d": "draw",
	"p": "bezier",
	"k": "point"
};

type ToolConstructor = {
	new (): PGTool;
}

// functions related to the toolbar

const activeTool = ref<PGTool | undefined>(undefined);
const previousTool = ref<PGTool | undefined>(undefined);

export function setup() {
	setupKeybinds();
	setDefaultTool();
}

function setupKeybinds() {
	if (config.exists("keybinds")) {
		const keybindsConfig = config.get("keybinds");
		Object.assign(keybinds, keybindsConfig);
	}
}

export function getActiveTool(): PGTool | undefined {
	return activeTool.value;
}

export const activeToolRef = computed<PGTool | undefined>(() => activeTool.value);
export const previousToolRef = computed<PGTool | undefined>(() => previousTool.value);

export function switchTool(toolID: string, forced?: boolean) {
	try {
		activeTool.value?.deactivateTool?.();
		const opts = tools.getToolInfoByID(toolID);
		let tool: PGTool;
		{
			const toolEntry: PGTool | ToolConstructor = tools.tools[toolID];
			if (typeof toolEntry === "function") tool = new toolEntry();
			else tool = toolEntry;
		}
		
		// writing the tool infos back into the tool.options object
		jQuery.each(opts, function(name, value: any) {
			tool.options[name] = value;
		});
		
		// don't switch to the same tool again unless "forced" is true
		if (activeTool.value && 
			activeTool.value.options.id === tool.options.id && 
			!forced) {
			return;
		}

		//don't assign a hidden tool to previous tool state
		//that is only useful/wanted for toolbar items
		if (activeTool.value && activeTool.value.options.type !== "hidden") {
			previousTool.value = activeTool.value;
		}
		resetTools();
		tool.activateTool();
		activeTool.value = tool;
		
		// console.log(`${previousTool?.options.id} \u2192 ${toolID}`);

	} catch (error) {
		console.warn(`The tool with the id "${toolID}" could not be loaded.`, error);
	}
}

export function resetTools() {
	if (activeTool.value != null) {
		try {
			activeTool.value.deactivateTool();
		} catch (e) {
			// this tool has no (optional) deactivateTool function
		}
		for (let i=0; i < paper.tools.length; i++) {
			paper.tools[i].remove();
		}
	}
	jQuery(".toolOptionPanel").remove();
	jQuery(".tool").removeClass("active");
}

export function setDefaultTool() {
	switchTool("select");
}
