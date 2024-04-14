// undo functionality
// slightly modifed from https://github.com/memononen/stylii
import paper from "paper";
import * as layer from "./layer";
import { triggers } from "./triggers";
import { Ref, computed, ref } from "vue";
import { markRaw } from "vue";

type UndoState = {
	type: string,
	data: any,
	hash: string,
}
const states: Ref<UndoState[]> = ref([]);
const head = ref(-1);
const maxUndos = 80;

export const statesRef = computed(() => states.value);
export const headRef = computed(() => head.value);

async function getDigest(source: string): Promise<string> {
	const buffer = new TextEncoder().encode(source);
	const digest = await crypto.subtle.digest("SHA-256", buffer);
	const hashArray = Array.from(new Uint8Array(digest));
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	return hashHex;
}

export function setup() {
	snapshot('init');
}

export async function snapshot(type: string) {
	const data = markRaw(paper.project.exportJSON({ asString: false}) as any);
	const state: UndoState = {
		type: type,
		hash: await getDigest(JSON.stringify(data)),
		data
	};
	
	// remove all states after the current head
	if (head.value < states.value.length-1) {
		states.value = states.value.slice(0, head.value+1);
	}
	
	// add the new states
	states.value.push(state);
	
	// limit states to maxUndos by shifing states (kills first state)
	if (states.value.length > maxUndos) {
		states.value.shift();
	}
	
	// set the head to the states length
	head.value = states.value.length-1;
	
	triggers.emit("Snapshot");
}

export function undo() {
	if (head.value > 0) {
		head.value--;
		restore(states.value[head.value]);
		triggers.emitAll(["Undo", "HistoryChanged"]);
	}
}

export function redo() {
	if (head.value < states.value.length-1) {
		head.value++;
		restore(states.value[head.value]);
		triggers.emitAll(["Redo", "HistoryChanged"]);
	}
}

export function moveHeadTo(position: number) {
	if (position < 0 || position >= states.value.length) {
		return;
	}
	if (position === head.value) return;
	head.value = position;
	restore(states.value[head.value]);
}

function restore(entry: UndoState) {
	const activeLayerID = paper.project.activeLayer.data.id;
	paper.project.clear();
	paper.view.update();
	paper.project.importJSON(entry.data);
	layer.reinitLayers(activeLayerID);
}

export function clear() {
	states.value = [];
	head.value = -1;
}

export function getStates() {
	return states.value;
}

export function getHead() {
	return head.value;
}