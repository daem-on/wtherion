import { openSearchDialog } from "./search";
import { save, exportTH2 } from "./filesio/saveManagement";
import stylebar from "../js/stylebar";
import * as view from "./view";
import * as undo from "./undo";
import toolbar from "./toolbar";
import * as menu from "./menu";
import * as tools from "./tools";
import * as selection from "./selection";
import viewzoom from "./tools/viewzoom";

// functions releated to input (mouse, keyboard)

type ViewzoomTool = ReturnType<typeof viewzoom>;
	
const downKeys = [];
let mouseIsDown = false;

export function setup() {
	setupKeyboard();
	setupMouse();
}

const setupKeyboard = function() {
	const toolList = tools.getToolList();
	
	jQuery(document).unbind('keydown').bind('keydown', function (event) {

		if(!isKeyDown(event.keyCode)) {
			storeDownKey(event.keyCode);
		}
		
		// only prevent default keypresses (see tools/select.js for more)
		// ctrl-a / select all
		if (event.keyCode === 65 && event.ctrlKey) {
			if(!textIsSelected() && !userIsTyping(event)) {
				event.preventDefault();
			}
		}
		// ctrl-i / invert selection
		if (event.keyCode === 73 && event.ctrlKey) {
			event.preventDefault();
		}
		
		// ctrl-g / group
		if (event.keyCode === 71 && event.ctrlKey && !event.shiftKey) {
			event.preventDefault();
		}

		// ctrl-shift-g / ungroup
		if (event.keyCode === 71 && event.ctrlKey && event.shiftKey) {
			event.preventDefault();
		}


		// ctrl-1 / reset view to 100%
		if ((event.keyCode === 97 || 
			event.keyCode === 49) &&
			event.ctrlKey && 
			!event.shiftKey) {

			event.preventDefault();
			view.resetZoom();
		}

		// ctrl-z / undo
		if ((event.keyCode === 90) && event.ctrlKey && !event.shiftKey) {
			event.preventDefault();
			undo.undo();
		}

		// ctrl-shift-z / undo
		if ((event.keyCode === 90) && event.ctrlKey && event.shiftKey) {
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
		if(event.keyCode === 8 && !userIsTyping(event)) {
			event.preventDefault();
		}


		// everything after this is blocked by mousedown!
		if(mouseIsDown) return;


		// alt
		if(event.keyCode === 18) {
			event.preventDefault();
		}

		// esc: blur all inputs
		if(event.key === "Escape") {
			jQuery('input, select, textarea, button').trigger("blur");
		}

		// space / pan tool
		if(event.key === " " && !userIsTyping(event)) {
			event.preventDefault();
			toolbar.switchTool('viewgrab');
		}
	});


	jQuery(document).unbind('keyup').bind('keyup', function( event ) {

		// remove event key from downkeys
		const index = downKeys.indexOf(event.keyCode);
		if(index > -1) {
			downKeys.splice(index, 1);
		}


		// ctrl
		if(event.key === "Control") {
			// if viewZoom is active and we just released ctrl,
			// reset tool to previous
			if(toolbar.getActiveTool().options.id === 'viewzoom') {
				toolbar.switchTool(toolbar.getPreviousTool().options.id);
			}
		}
		
		if(userIsTyping(event)) return;


		// space : stop pan tool on keyup
		if(event.keyCode === 32) {
			if(!isModifierKeyDown(event)) {
				event.preventDefault();
				toolbar.switchTool(toolbar.getPreviousTool().options.id);
			}
		}

		if(mouseIsDown) return;
		if(isModifierKeyDown(event)) return;


		// ----------------------------------------
		// keys that don't fire if modifier key down or mousedown or typing

		// backspace, delete : delete selection
		if(event.keyCode === 8 || event.keyCode === 46) {
			selection.deleteSelection();
		}

		// x : switch color
		if(event.keyCode === 88) {
			stylebar.switchColors();
		}

		// tool keys (switching to tool by key shortcut)
		jQuery.each(toolList, function(index, toolEntry) {
			if(toolEntry.usedKeys && toolEntry.usedKeys.toolbar) {
				if(event.keyCode === toolEntry.usedKeys.toolbar.toUpperCase().charCodeAt(0)) {
					toolbar.switchTool(toolEntry.id);
				}
			}
		});
		
	});
};


const storeDownKey = function(keyCode) {
	if(downKeys.indexOf(keyCode) < 0) {
		downKeys.push(keyCode);
	}
};


export function isMouseDown() {
	return mouseIsDown;
}


const isKeyDown = function(keyCode) {
	if(downKeys.indexOf(keyCode) < 0) {
		return false;
	} else {
		return true;
	}
};


export function isModifierKeyDown(event) {
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
	window.addEventListener("wheel", function (event) {
		if(event.ctrlKey) {
			event.preventDefault();
			if (toolbar.getActiveTool().options.id !== 'viewzoom') {
				toolbar.switchTool('viewzoom');
			}
			if(toolbar.getActiveTool()) {
				(toolbar.getActiveTool() as ViewzoomTool).updateTool(event);
			}
		}
	}, {passive: false});
};
