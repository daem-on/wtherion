import { openSearchDialog } from "./search";
import { saveManager, exportTH2 } from "./filesio/saveManagement/saveManagement";
import * as config from "./filesio/configManagement";
import { activeToolRef, getActiveTool, loadCustomKeybinds, registerAction, serializeCustomKeybinds, setupInput, unduckTool } from "grapht/tools";
import { resetZoom } from "./view";
import { redo, undo } from "./undo";
import editTH2 from "./editTH2";
import paper from "paper";
import { switchToolById } from "./tools";

export function setup() {
	setupInput(paper);
	setupKeybinds();
	setupMouse();

	if (config.exists("keybinds")) {
		const keybindsConfig = config.get("keybinds");
		loadCustomKeybinds(keybindsConfig);
	}
}

export function persistCustomKeybinds() {
	const keybinds = serializeCustomKeybinds();
	config.set("keybinds", keybinds);
}

function setupKeybinds() {
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
	registerAction("global.save", saveManager.save, "ctrl-s");
	registerAction("global.export", exportTH2, "ctrl-e");

	registerAction("th2.lineToArea", () => editTH2.lineToArea(), "ctrl-h");
	registerAction("th2.areaToLine", () => editTH2.areaToLine(), "ctrl-shift-h");
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
};

function unduckViewzoom() {
	if (getActiveTool().definition.id === "viewzoom") {
		unduckTool();
	}
}