import paper from "paper";
import { select } from "./tools/select";
import { detailselect } from "./tools/detailselect";
import { draw } from "./tools/draw";
import { bezier } from "./tools/bezier";
import { point } from "./tools/point";
import { viewgrab } from "./tools/viewgrab";
import { viewzoom } from "./tools/viewzoom";
import { inspect } from "./tools/inspect";
import { computed, ref } from "vue";
import { KeySpec, registerAction } from "./input";

const createToolRegistry = <Id extends string>(initializers: { [K in Id]: WtToolInitializer<K> }) => initializers;

const registry = createToolRegistry({
	select,
	detailselect,
	draw,
	bezier,
	point,
	viewgrab,
	viewzoom,
	inspect,
});

type ToolId = keyof typeof registry;

const tools = ref<{ [K in ToolId]: WtTool<K> } | undefined>();

export const toolsRef = computed(() => tools.value);

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
	"command": string,
};

type EventHandler<T extends keyof ToolEventMap> = (event: ToolEventMap[T]) => void
type EventHandlerRegisterer = <T extends keyof ToolEventMap>(eventName: T, handler: EventHandler<T>) => void;

type CustomHandlers = {
	onWheel?: EventHandler<"wheel">,
	onActivate?: EventHandler<"activate">,
	onDeactivate?: EventHandler<"deactivate">,
	onCommand?: EventHandler<"command">,
};

type WtTool<Id extends string = ToolId> = {
	tool: paper.Tool,
	definition: ToolDefinition<Id>,
	customHandlers: CustomHandlers,
};

type WtToolInitializer<Id extends string> = () => WtTool<Id>;

export function defineTool<Id extends string>(settings: {
	definition: ToolDefinition<Id>,
	setup: (on: EventHandlerRegisterer, tool: paper.Tool) => void
}): WtToolInitializer<Id> {
	return (): WtTool<Id> => {
		const tool = new paper.Tool();
	
		const customHandlers: CustomHandlers = {};
		const addEvent: EventHandlerRegisterer = (eventName, handler: EventHandler<any>) => {
			switch (eventName) {
				case "wheel": customHandlers.onWheel = handler; break;
				case "activate": customHandlers.onActivate = handler; break;
				case "deactivate": customHandlers.onDeactivate = handler; break;
				case "command": customHandlers.onCommand = handler; break;
				default: tool.on(eventName, handler);
			}
		};

		settings.setup(addEvent, tool);

		if (settings.definition.commands && customHandlers.onCommand) {
			for (const command in settings.definition.commands) {
				const key = settings.definition.commands[command];
				registerAction(command, createActionCallback(settings.definition.id, command, customHandlers.onCommand), key);
			}
		}
		return {
			tool,
			customHandlers,
			definition: settings.definition,
		};
	};
}

function createActionCallback(toolId: string, command: string, handler: EventHandler<"command">) {
	return () => {
		if (activeTool.value?.definition.id === toolId) {
			handler(command);
		}
	};
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
	commands?: {
		[name: string]: KeySpec;
	},
	options: Record<string, any>
}

const activeTool = ref<WtTool | undefined>(undefined);
const duckedTool = ref<WtTool | undefined>(undefined);

export function setup() {
	initializeTools();
	setDefaultTool();
}

function initializeTools() {
	const tempTools = {};
	for (const key in registry) {
		tempTools[key] = registry[key]();
	}
	tools.value = tempTools as any;
}

export function getActiveTool(): WtTool | undefined {
	return activeTool.value;
}

export const activeToolRef = computed<WtTool | undefined>(() => activeTool.value);
export const duckedToolRef = computed<WtTool | undefined>(() => duckedTool.value);

export function switchToolById(toolId: ToolId, options?: { force?: true, duck?: true }) {
	switchTool(tools.value[toolId], options);
}

export function switchTool(tool: WtTool, options?: { force?: true, duck?: true }) {
	const toolId = tool.definition.id;

	try {
		const active = activeTool.value;
		active?.customHandlers.onDeactivate?.();
		
		if (active?.definition.id === toolId && !options?.force) {
			return;
		}

		if (active?.definition.options.type !== "hidden" && options?.duck) {
			duckedTool.value = active;
		} else {
			duckedTool.value = undefined;
		}
		
		const previousTool = active;
		tool.tool.activate();
		tool.customHandlers.onActivate?.();
		activeTool.value = tool;
		
		console.log(`${previousTool?.definition.id} \u2192 ${toolId}`);

	} catch (error) {
		console.warn(`The tool with the id "${toolId}" could not be loaded.`, error);
	}
}

export function setDefaultTool() {
	switchToolById("select");
}

export function unduckTool() {
	if (duckedTool.value) {
		switchTool(duckedTool.value);
	}
}
