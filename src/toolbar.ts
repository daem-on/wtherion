import paper from "paper";
import * as tools from "./tools";
import * as config from "./filesio/configManagement";
import { computed, ref } from "vue";

export type PGToolOptions = {
	id: string;
	name: string;
	type?: string;
	usedKeys?: {
		[name: string]: string;
	}
}

export type PGTool = {
	activateTool: () => void,
	deactivateTool: () => void,
	updateTool?: (e: WheelEvent) => void,
	options: PGToolOptions
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

