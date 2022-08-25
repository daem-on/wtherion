// undo functionality
// slightly modifed from https://github.com/memononen/stylii
import pg from "./init";
import paper from "paper";

type UndoState = {
	type: string,
	json: any,
}

let states: UndoState[] = [];
let head = -1;
const maxUndos = 80;

export function setup() {
	pg.undo.snapshot('init');
}

export function snapshot(type: string) {
	const state: UndoState = {
		type: type, 
		json: paper.project.exportJSON({ asString: false})
	};
	
	// remove all states after the current head
	if(head < states.length-1) {
		states = states.slice(0, head+1);
	}
	
	// add the new states
	states.push(state);
	
	// limit states to maxUndos by shifing states (kills first state)
	if(states.length > maxUndos) {
		states.shift();
	}
	
	// set the head to the states length
	head = states.length-1;
	
	jQuery(document).trigger("Snapshot");
}


export function undo() {
	if(head > 0) {
		head--;
		restore(states[head]);
		jQuery(document).trigger('Undo').trigger("HistoryChanged");
	}
}


export function redo() {
	if(head < states.length-1) {
		head++;
		restore(states[head]);
		jQuery(document).trigger('Redo').trigger("HistoryChanged");
	}
}


export function removeLastState() {
	states.splice(-1, 1);
}

export function moveHeadTo(position: number) {
	if (position < 0 || position >= states.length) {
		return;
	}
	head = position;
	restore(states[head]);
}

function restore(entry: UndoState) {
	const activeLayerID = paper.project.activeLayer.data.id;
	paper.project.clear();
	paper.view.update();
	paper.project.importJSON(entry.json);
	pg.layer.reinitLayers(activeLayerID);
}


export function clear() {
	states = [];
	head = -1;
}


export function getStates() {
	return states;
}


export function getHead() {
	return head;
}