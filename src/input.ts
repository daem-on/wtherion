import { openSearchDialog } from "./search";
import { save, exportTH2 } from "./filesio/saveManagement/saveManagement";
import * as config from "./filesio/configManagement";
import { activeToolRef, getActiveTool, switchToolById, unduckTool } from "./tools";
import { resetZoom } from "./view";
import { redo, undo } from "./undo";
import editTH2 from "./editTH2";
import { reactive } from "vue";
import paper from "paper";

export function setup() {
	setupKeyboard();
	setupMouse();
	loadCustomKeybinds();
}

const keys = [
	'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
	'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
	'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
	'enter', 'backspace', 'delete', 'escape', 'space', 'control'
] as const;

type Key = typeof keys[number];
export type KeySpec = `${'ctrl-' | ''}${'shift-' | ''}${Key}${'-up' | ''}`;

export const currentBinds = reactive(new Map<KeySpec, Set<string>>());
const actionCallbacks = new Map<string, () => void>();

export function registerAction(name: string, callback: () => void, defaultBind?: KeySpec) {
	actionCallbacks.set(name, callback);
	if (defaultBind) {
		if (!currentBinds.has(defaultBind)) {
			currentBinds.set(defaultBind, new Set());
		}
		currentBinds.get(defaultBind).add(name);
	}
}

export function getActionList(): string[] {
	return Array.from(actionCallbacks.keys());
}

function loadCustomKeybinds() {
	if (config.exists("keybinds")) {
		const keybindsConfig = config.get("keybinds");
		currentBinds.clear();
		for (const bind of keybindsConfig) {
			if (keySpecIsValid(bind.key))
				currentBinds.set(bind.key, bind.command);
		}
	}
}

const keySpecRegex = /^(ctrl-)?(shift-)?([a-z0-9]+)(-up)?$/;
function keySpecIsValid(input: string): input is KeySpec {
	const match = keySpecRegex.exec(input);
	if (!match) return false;
	if (!keys.includes(match[3] as Key)) return false;
	return true;
}

export function getKeySpec(event: KeyboardEvent, up: boolean): KeySpec {
	let spec = "";
	if (event.ctrlKey || event.metaKey) spec += "ctrl-";
	if (event.shiftKey) spec += "shift-";
	const key = event.key === " " ? "space" : event.key.toLowerCase();
	spec += key;
	if (up) spec += "-up";
	return spec as KeySpec;
}

function setupKeyboard() {
	function handleKeyEvent(event: KeyboardEvent, up: boolean) {
		if (event.key === "Escape") {
			blurCurrent();
			return;
		}
		if (userIsTyping(event)) return;
		if (event.repeat) return;
		const spec = getKeySpec(event, up);
		if (currentBinds.has(spec)) {
			const actions = currentBinds.get(spec);
			for (const action of actions) {
				actionCallbacks.get(action)();
			}
			event.preventDefault();
		}
	}

	window.addEventListener("keydown", event => {
		handleKeyEvent(event, false);
	});

	window.addEventListener("keyup", event => {
		handleKeyEvent(event, true);
	});

	registerAction("global.tool.select", () => switchToolById("select"), "v");
	registerAction("global.tool.detailselect", () => switchToolById("detailselect"), "a");
	registerAction("global.tool.draw", () => switchToolById("draw"), "d");
	registerAction("global.tool.bezier", () => switchToolById("bezier"), "p");
	registerAction("global.tool.point", () => switchToolById("point"), "k");

	registerAction("global.tool.viewgrab", viewgrabDown, "space");
	registerAction("global.tool.viewgrab.up", viewgrabUp, "space-up");

	registerAction("global.tool.inspect", () => switchToolById("inspect", { duck: true }), "m");
	registerAction("global.tool.inspect.up", () => unduckTool(), "m-up");

	registerAction("global.tool.viewzoom.up", unduckViewzoom, "control-up");

	registerAction("global.resetzoom", resetZoom, "ctrl-0");
	registerAction("global.undo", undo, "ctrl-z");
	registerAction("global.redo", redo, "ctrl-shift-z");
	registerAction("global.search", openSearchDialog, "ctrl-f");
	registerAction("global.save", save, "ctrl-s");
	registerAction("global.export", exportTH2, "ctrl-e");

	registerAction("th2.lineToArea", () => editTH2.lineToArea(), "ctrl-h");
	registerAction("th2.areaToLine", () => editTH2.areaToLine(), "ctrl-shift-h");
}

export function textIsSelected() {
	if (window.getSelection().toString()) {
		return true;
	}

	return false;
}

export function userIsTyping(event: KeyboardEvent) {
	return event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
}

function viewgrabDown() {
	if (document.activeElement instanceof HTMLButtonElement
		|| document.activeElement instanceof HTMLAnchorElement
		|| document.activeElement instanceof HTMLHeadingElement) {
		document.activeElement.click();
		return;
	}
	switchToolById("viewgrab", { duck: true });
}

function viewgrabUp() {
	if (activeToolRef.value.definition.id === "viewgrab") {
		unduckTool();
	}
}

function blurCurrent() {
	const active = document.activeElement;
	if (active instanceof HTMLElement) active.blur();
}

// mouse stuff

const setupMouse = function() {
	// special case for viewzoom, which cannot be handled by the keybinds
	window.addEventListener("wheel", event => {
		if (event.ctrlKey) {
			event.preventDefault();

			if (getActiveTool().definition.id !== "viewzoom")
				switchToolById("viewzoom", { duck: true });
		}
		getActiveTool().emit("wheel", event);
	}, { passive: false });

	paper.view.onMouseDown = () => blurCurrent();
};

function unduckViewzoom() {
	if (getActiveTool().definition.id === "viewzoom") {
		unduckTool();
	}
}