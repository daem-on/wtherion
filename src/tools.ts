import paper from "paper";
import { select } from "./tools/select";
import { detailselect } from "./tools/detailselect";
import { draw } from "./tools/draw";
import { bezier } from "./tools/bezier";
import { point } from "./tools/point";
import { viewgrab } from "./tools/viewgrab";
import { viewzoom } from "./tools/viewzoom";
import { inspect } from "./tools/inspect";
import { Component, computed, ref, watch } from "vue";
import { registerAction } from "./input";
import { ToolAction, ToolMenuEntry, compileToolMenu } from "./toolMenu";

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
};

type EventHandler<T extends keyof ToolEventMap> = (event: ToolEventMap[T]) => void
type EventHandlerRegisterer = <T extends keyof ToolEventMap>(eventName: T, handler: EventHandler<T>) => void;
type EventEmitter = <T extends keyof ToolEventMap>(eventName: T, event: ToolEventMap[T]) => void;

type WtTool<Id extends string = ToolId> = {
	tool: paper.Tool,
	definition: ToolDefinition<Id>,
	uiState?: ToolUiState,
	emit: EventEmitter,
	menu: ToolMenuEntry[],
};

type WtToolInitializer<Id extends string> = () => WtTool<Id>;

export function defineTool<Id extends string>(settings: {
	definition: ToolDefinition<Id>,
	uiState?: ToolUiState,
	setup: (on: EventHandlerRegisterer, tool: paper.Tool) => void
}): WtToolInitializer<Id> {
	return (): WtTool<Id> => {
		const tool = new paper.Tool();
	
		const addEvent: EventHandlerRegisterer = (eventName, handler: EventHandler<any>) => {
			tool.on(eventName, handler);
		};

		settings.setup(addEvent, tool);

		if (settings.definition.actions) {
			for (const action of settings.definition.actions) {
				const key = action.defaultKey;
				const id = settings.definition.id;
				const name = `${id}.${action.name}`;
				registerAction(name, createActionCallback(id, action.callback), key);
			}
		}
		return {
			tool,
			emit: (eventName, event) => tool.emit(eventName, event as any),
			uiState: settings.uiState,
			definition: settings.definition,
			menu: compileToolMenu(settings.definition.actions),
		};
	};
}

function createActionCallback(toolId: string, callback: () => void) {
	return () => {
		const active = activeTool.value;
		if (active?.definition.id === toolId) {
			callback();
		}
	};
}

type ToolUiState = {
	options: Record<string, any>;
}

// legacy localstorage
export function getLocalOptions<T extends { id: string }>(options: T): T {
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

// new localstorage
function persistOptions(id: ToolId, options: Record<string, any>) {
	localStorage.setItem(`pg.tools.${id}`, JSON.stringify(options));
}

function loadOptions(id: ToolId): Record<string, any> {
	const optionsJSON = localStorage.getItem(`pg.tools.${id}`);
	return optionsJSON ? JSON.parse(optionsJSON) : {};
}

function watchOptionsChanges() {
	watch(() => activeTool.value?.uiState?.options, (options, oldValue) => {
		const id = activeTool.value?.definition.id;
		// only persist when values *inside* the object change, not the object itself
		if (options !== oldValue) return;
		if (id && options) persistOptions(id, options);
	}, { deep: true });
}

export type ToolDefinition<Id extends string> = {
	id: Id;
	name: string;
	type?: "hidden";
	actions?: ToolAction[],
	panel?: Component,
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
	for (const tool of Object.values(tools.value)) {
		if (tool.uiState) {
			Object.assign(tool.uiState.options, loadOptions(tool.definition.id));
		}
	}
	watchOptionsChanges();
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

		if (active?.definition.id === toolId && !options?.force) return;

		active?.emit("deactivate", undefined);

		if (active?.definition.type !== "hidden" && options?.duck) {
			duckedTool.value = active;
		} else {
			duckedTool.value = undefined;
		}
		
		const previousTool = active;
		tool.tool.activate();
		tool.emit("activate", undefined);
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
