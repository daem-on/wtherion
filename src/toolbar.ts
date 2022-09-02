import paper from "paper";
import stylebar from "../js/stylebar";
import statusbar from "../js/statusbar";
import * as tools from "./tools";

export type PGToolOptions = {
	id: string;
	name: string;
	type?: string;
	usedKeys?: {
		[name: string]: string;
	};
};

export type PGTool = {
	activateTool: () => void,
	deactivateTool: () => void,
	options: Record<string, any>
}

type ToolConstructor = {
	new (): PGTool;
};

// functions related to the toolbar

let activeTool: PGTool;
let previousTool: PGTool;

const setup = function() {
	setupToolList();
	setDefaultTool();
};


const setupToolList = function() {
	const toolList= tools.getToolList();
	const $toolsContainer = jQuery(".toolsContainer");
	
	jQuery.each(toolList, function(index, tool) {
		if(tool.type === "hidden") return true;
		
		let shortCutInfo = "";
		if(tool.usedKeys && tool.usedKeys.toolbar !== "") {
			shortCutInfo = " ("+(tool.usedKeys.toolbar).toUpperCase()+")";
		}
		const $tool = jQuery(`<div>`)
			.addClass(`tool_${tool.id} tool`)
			.attr("data-id", tool.id)
			.attr("title", tool.name + shortCutInfo)
			.css({"background-image": `url(assets/tools/tool_${tool.id}.svg)`})
			.on("click", () => switchTool(tool.id))
			.appendTo($toolsContainer);
	});
	
	statusbar.update();
};

const getActiveTool = function() {
	return activeTool;
};


const getPreviousTool = function() {
	return previousTool;
};

const switchTool = function(toolID: string, forced?: boolean) {
	try {
		activeTool?.deactivateTool?.();
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
		if( activeTool && 
			activeTool.options.id === tool.options.id && 
			!forced) {
			return;
		}

		//don't assign a hidden tool to previous tool state
		//that is only useful/wanted for toolbar items
		if(activeTool && activeTool.options.type !== "hidden") {
			previousTool = activeTool;
		}
		resetTools();
		stylebar.sanitizeSettings();
		tool.activateTool();
		activeTool = tool;
		jQuery(`.tool_${toolID}`).addClass("active");
		// console.trace();
		// console.log(`${toolID} is now active`, jQuery('.tool_'+toolID+''));

	} catch(error) {
		console.warn(`The tool with the id "${toolID}" could not be loaded.`, error);
	}
};


const resetTools = function() {
	if(activeTool != null) {
		try {
			activeTool.deactivateTool();
		} catch(e) {
			// this tool has no (optional) deactivateTool function
		}
		for(let i=0; i < paper.tools.length; i++) {
			paper.tools[i].remove();
		}
	}
	jQuery(".toolOptionPanel").remove();
	jQuery(".tool").removeClass("active");
};


const setDefaultTool = function() {
	switchTool("select");
};
	
	
export default {
	setup: setup,
	getActiveTool: getActiveTool,
	getPreviousTool: getPreviousTool,
	switchTool: switchTool,
	resetTools: resetTools,
	setDefaultTool: setDefaultTool
};
