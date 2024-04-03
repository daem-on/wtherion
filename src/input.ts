import { openSearchDialog } from "./search";
import { save, exportTH2 } from "./filesio/saveManagement/saveManagement";
import * as view from "./view";
import * as undo from "./undo";
import * as toolbar from "./toolbar";
import * as menu from "./menu";
import * as tools from "./tools";
import * as selection from "./selection";
import viewzoom from "./tools/viewzoom";

// functions releated to input (mouse, keyboard)

type ViewzoomTool = ReturnType<typeof viewzoom>;
	
const downKeys: Record<string, boolean> = {};
let mouseIsDown = false;

export function setup() {
	setupKeyboard();
	setupMouse();
}

function setupKeyboard() {
	const toolList = tools.getToolList();

	jQuery(document).off(".pg");
	
	jQuery(document).on("keydown.pg", function (event: JQuery.KeyDownEvent) {

		if(!isKeyDown(event.key)) {
			storeDownKey(event.key);
		}

		// we're only interested in the original keydown events
		// not the repeats
		if (event.originalEvent.repeat) return;
		
		// only prevent default keypresses (see tools/select.js for more)
		// ctrl-a / select all
		if (event.key === "a" && event.ctrlKey) {
			if(!textIsSelected() && !userIsTyping(event)) {
				event.preventDefault();
			}
		}
		// ctrl-i / invert selection
		if (event.key === "i" && event.ctrlKey) {
			event.preventDefault();
		}
		
		// ctrl-g / group
		if (event.key === "g" && event.ctrlKey && !event.shiftKey) {
			event.preventDefault();
		}

		// ctrl-shift-g / ungroup
		if (event.key === "g" && event.ctrlKey && event.shiftKey) {
			event.preventDefault();
		}


		// ctrl-1 / reset view to 100%
		if ((event.key === "1") && event.ctrlKey && !event.shiftKey) {
			event.preventDefault();
			view.resetZoom();
		}

		// ctrl-z / undo
		if ((event.key === "z") && event.ctrlKey && !event.shiftKey) {
			event.preventDefault();
			undo.undo();
		}

		// ctrl-shift-z / undo
		if ((event.key === "z") && event.ctrlKey && event.shiftKey) {
			event.preventDefault();
			undo.redo();
		}

		if (event.key === "f" && event.ctrlKey) {
			event.preventDefault();
			openSearchDialog();
		}

		if (event.key === "s" && event.ctrlKey) {
			event.preventDefault();
			save();
		}

		if (event.key === "e" && event.ctrlKey) {
			event.preventDefault();
			exportTH2();
		}

		// backspace / stop browsers "back" functionality
		if(event.key === "Backspace" && !userIsTyping(event)) {
			event.preventDefault();
		}


		// everything after this is blocked by mousedown!
		if(mouseIsDown) return;


		// alt
		if(event.key === "Alt") {
			event.preventDefault();
		}

		// esc: blur all inputs
		if(event.key === "Escape") {
			jQuery('input, select, textarea, button').trigger("blur");
		}

		// space / pan tool
		// m / inspect tool
		if (!userIsTyping(event)) {
			switch (event.key) {
				case " ":
					if (toolbar.getActiveTool().options.id === "viewgrab")
						break;
					event.preventDefault();
					toolbar.switchTool('viewgrab');
					break;
				case "m":
					if (toolbar.getActiveTool().options.id === "inspect")
						break;
					event.preventDefault();
					toolbar.switchTool('inspect');
			}
		}
	});


	jQuery(document).on("keyup.pg", function( event: JQuery.KeyUpEvent ) {

		// remove event key from downkeys
		downKeys[event.key] = false;

		// ctrl
		if(event.key === "Control") {
			// if viewZoom is active and we just released ctrl,
			// reset tool to previous
			if(toolbar.getActiveTool().options.id === 'viewzoom') {
				resetToPreviousTool();
			}
		}
		
		if(userIsTyping(event)) return;

		// space : stop pan tool on keyup
		// m: same for inspect tool
		if(event.key === " " || event.key === "m") {
			if(!isModifierKeyDown(event)) {
				event.preventDefault();
				resetToPreviousTool();
			}
		}

		if(mouseIsDown) return;
		if(isModifierKeyDown(event)) return;


		// ----------------------------------------
		// keys that don't fire if modifier key down or mousedown or typing

		// backspace, delete : delete selection
		if(event.key === "Backspace" || event.key === "Delete") {
			selection.deleteSelection();
		}

		// tool keys (switching to tool by key shortcut)
		for (const keybind in toolbar.keybinds) {
			if (event.key === keybind) {
				toolbar.switchTool(toolbar.keybinds[keybind]);
			}
		}
		
	});
}

function resetToPreviousTool() {
	const previous = toolbar.getPreviousTool();
	toolbar.switchTool(previous?.options.id ?? "select");
}

function storeDownKey(keyCode: string) {
	if(downKeys[keyCode]) {
		downKeys[keyCode] = true;
	}
}

export function isMouseDown() {
	return mouseIsDown;
}


function isKeyDown(keyCode: string) {
	return downKeys[keyCode];
}


export function isModifierKeyDown(event: JQuery.KeyUpEvent) {
	if( event.altKey || 
		event.shiftKey || 
		event.ctrlKey || 
		(event.ctrlKey && event.altKey)) {
		return true;
	} else {
		return false;
	}
}


export function textIsSelected() {
	if (window.getSelection().toString()) {
		return true;
	}
	// if(document.selection && document.selection.createRange().text) {
	// 	return true;
	// }

	return false;
}


export function userIsTyping(event) {		
	const d = event.srcElement || event.target;
	if ((d.tagName.toUpperCase() === 'INPUT' &&
		(
			d.type.toUpperCase() === 'TEXT' ||
			d.type.toUpperCase() === 'PASSWORD' ||
			d.type.toUpperCase() === 'FILE' || 
			d.type.toUpperCase() === 'EMAIL' ||
			d.type.toUpperCase() === 'SEARCH' ||
			d.type.toUpperCase() === 'DATE' ||
			d.type.toUpperCase() === 'NUMBER' )
		)
	|| d.tagName.toUpperCase() === 'TEXTAREA') {
		return true;
	}
	
	return false;
}



// mouse stuff

const setupMouse = function() {

	jQuery('body').on('mousedown', function (e) {
		if ((e.which === 1)) { //left
			mouseIsDown = true;
		}
		if ((e.which === 3)) { // right
			
		}
		if ((e.which === 2)) { //middle
			
		}
		
		
	}).on('mouseup', function(e) {
		if ((e.which === 1)) { // left
			mouseIsDown = false;
		}
		if ((e.which === 2)) { // middle
			
		}
		if((e.which === 3)) { //right
			
		}

	}).on('contextmenu', function (e) {
		e.preventDefault();
		menu.showContextMenu(e);
	});
	
	// jQuery(window).on('mousewheel DOMMouseScroll', function(event){
	window.addEventListener("wheel", onMouseWheel, {passive: false});
};

function onMouseWheel(event: WheelEvent) {
	if(event.ctrlKey) {
		event.preventDefault();
		if (toolbar.getActiveTool().options.id !== 'viewzoom') {
			toolbar.switchTool('viewzoom');
		}
		if(toolbar.getActiveTool()) {
			(toolbar.getActiveTool() as ViewzoomTool).updateTool(event);
		}
	}
}