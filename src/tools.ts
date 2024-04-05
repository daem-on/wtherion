import { select } from "./tools/select";
import { detailselect } from "./tools/detailselect";
import { draw } from "./tools/draw";
import { bezier } from "./tools/bezier";
import { point } from "./tools/point";
import { viewgrab } from "./tools/viewgrab";
import { viewzoom } from "./tools/viewzoom";
import { inspect } from "./tools/inspect";
import paper from "paper";
import * as config from "./filesio/configManagement";
import { computed, ref } from "vue";

const createToolRegistry = <Id extends string>(defintions: { [K in Id]: WtTool<K> }) => defintions;

export const tools = createToolRegistry({
	select,
	detailselect,
	draw,
	bezier,
	point,
	viewgrab,
	viewzoom,
	inspect,
});

type ToolId = keyof typeof tools;

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

type WtTool<Id extends string = ToolId> = {
	tool: paper.Tool,
	definition: ToolDefinition<Id>,
	customHandlers: CustomHandlers,
};

export function defineTool<Id extends string>(settings: {
	definition: ToolDefinition<Id>,
	setup: (on: EventHandlerRegisterer, tool: paper.Tool) => void
}): WtTool<Id> {
	const tool = new paper.Tool();

	const customHandlers: CustomHandlers = {};
	const addEvent: EventHandlerRegisterer = (eventName, handler: EventHandler<any>) => {
		switch (eventName) {
			case "wheel": customHandlers.onWheel = handler; break;
			case "activate": customHandlers.onActivate = handler; break;
			case "deactivate": customHandlers.onDeactivate = handler; break;
			default: tool.on(eventName, handler);
		}
	};
	settings.setup(addEvent, tool);
	return {
		tool,
		customHandlers,
		definition: settings.definition,
	};
}

export function getToolList(): WtTool[] {
	return Object.values(tools);
}

type ToolSettings = {
	[key: string]: any,
	id: string
}

// localstorage
export function getLocalOptions<T extends ToolSettings>(options: T): T {
	const storageJSON = localStorage.getItem('pg.tools.'+options.id);
	if (storageJSON && storageJSON.length > 0) {
		const storageOptions = JSON.parse(storageJSON);
		
		// only overwrite options that are stored
		// new options will use their default value
		for (const option in options) {
			if (Object.prototype.hasOwnProperty.call(storageOptions, option)) {
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

export type ToolDefinition<Id extends string> = {
	id: Id;
	name: string;
	type?: "hidden";
	usedKeys?: {
		[name: string]: string;
	},
	options: Record<string, any>
}

export const keybinds: Record<string, string> = {
	"v": "select",
	"a": "detailselect",
	"d": "draw",
	"p": "bezier",
	"k": "point"
};

const activeTool = ref<WtTool | undefined>(undefined);
const previousTool = ref<WtTool | undefined>(undefined);

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

export function getActiveTool(): WtTool | undefined {
	return activeTool.value;
}

export const activeToolRef = computed<WtTool | undefined>(() => activeTool.value);
export const previousToolRef = computed<WtTool | undefined>(() => previousTool.value);

export function switchTool(toolID: ToolId, options?: { force?: true, duck?: true }) {
	try {
		const active = activeTool.value;
		active.customHandlers.onDeactivate?.();

		const tool = tools[toolID];
		
		// don't switch to the same tool again unless "forced" is true
		if (active && active.definition.id === tool.definition.id && !options.force) {
			return;
		}

		//don't assign a hidden tool to previous tool state
		//that is only useful/wanted for toolbar items
		if (active && active.definition.options.type !== "hidden") {
			previousTool.value = active;
		}
		resetTools();
		tool.tool.activate();
		tool.customHandlers.onActivate?.();
		activeTool.value = tool;
		
		// console.log(`${previousTool?.options.id} \u2192 ${toolID}`);

	} catch (error) {
		console.warn(`The tool with the id "${toolID}" could not be loaded.`, error);
	}
}

export function resetTools() {
	const active = activeTool.value;
	if (active != null) {
		try {
			active.customHandlers.onDeactivate?.();
		} catch (e) {
			// this tool has no (optional) deactivateTool function
		}
		for (let i=0; i < paper.tools.length; i++) {
			paper.tools[i].remove();
		}
	}
}

export function setDefaultTool() {
	switchTool("select");
}
